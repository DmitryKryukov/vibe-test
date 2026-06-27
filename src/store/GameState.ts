import Phaser from 'phaser';
import { Heroes } from '@/data/Heroes';
import { Squires } from '@/data/Squires';


export interface RunState {
    active: boolean;
    heroId: string;
    squireId: string;
    hp: number;
    maxHp: number;
    gold: number;
    //xp: number;
    //level: number;
    //trainingPoints: number;
    //equipment: (InventoryItem | null)[];
    //bag: (InventoryItem | null)[];
    //map: MapNodeState[];
    //currentNodeId: string;
    //completedNodeIds: string[];
    seed: number;
}
export interface StoredGameState {
    run: RunState | null;
    //meta: MetaState;
}

class GameStateStore {
    state: StoredGameState = { run: null };

    resetAll(): void {
        this.state = { run: null };
    }

    hydrate(state: StoredGameState): void {
        this.state = state;
        this.normalizeStartLinks();
    }

    startRun(heroId: string, squireId: string): void {
      
      const heroIdClean = heroId.replace('-hero','')
      const squireIdClean = squireId.replace('-squire','')
      const hero = Heroes[heroIdClean];
      const squire = Squires[squireIdClean];
        
        this.state.run = {
            active: true,
            heroId: heroIdClean,
            squireId: squireIdClean,
            hp: hero.baseStats.maxHp,
            maxHp: hero.baseStats.maxHp,
            gold: 0,
            seed: Math.floor(Math.random() * 999999)
        };
    }
    /*
      generateMap(extraBranches: number): MapNodeState[] {
        const nodes: MapNodeState[] = [{ id: 'n0-1', column: 0, row: 1, type: 'start', links: [], visited: true, available: true, revealed: true }];
        const columnRows = new Map<number, number[]>();
        columnRows.set(0, [1]);
        for (let c = 1; c <= 7; c += 1) {
          const count = c === 7 ? 1 : c === 1 ? 4 : Math.min(4, 2 + Math.floor(Math.random() * (2 + Math.min(extraBranches, 2))));
          const rows = c === 7 ? [1] : c === 1 ? [0, 1, 2, 3] : Phaser.Math.RND.shuffle([0, 1, 2, 3]).slice(0, count).sort((a, b) => a - b);
          columnRows.set(c, rows);
          rows.forEach((row, i) => {
            const type = c === 7 ? 'boss' : this.pickNodeType(c, i);
            nodes.push({ id: `n${c}-${row}`, column: c, row, type, links: [], visited: false, available: false, revealed: c <= 2 });
          });
        }
        for (let c = 0; c < 7; c += 1) {
          const fromRows = columnRows.get(c) ?? [];
          const toRows = columnRows.get(c + 1) ?? [];
          fromRows.forEach((row) => {
            const from = nodes.find((node) => node.id === `n${c}-${row}`);
            if (!from) return;
            const sorted = [...toRows].sort((a, b) => Math.abs(a - row) - Math.abs(b - row));
            const linkRows = c === 0 ? sorted : sorted.slice(0, Math.min(2, sorted.length));
            from.links = linkRows.map((targetRow) => `n${c + 1}-${targetRow}`);
          });
        }
        nodes.find((node) => node.id === 'n0-1')?.links.forEach((id) => {
          const node = nodes.find((candidate) => candidate.id === id);
          if (node) node.available = true;
        });
        return nodes;
      }
    */

    normalizeStartLinks(): void {
        const run = this.state.run;
        if (!run) return;
        /*
        const start = run.map.find((node) => node.id === 'n0-1' || node.type === 'start');
        if (!start) return;
        const firstColumn = run.map.filter((node) => node.column === 1).map((node) => node.id);
        start.links = firstColumn;
        if (run.currentNodeId === start.id) {
          run.map.forEach((node) => {
            node.available = node.column === 1 || node.id === start.id;
            if (node.column <= 2) node.revealed = true;
          });
        }
        */
    }
    /*
      pickNodeType(column: number, index: number): MapNodeState['type'] {
        if (column === 1) return 'battle';
        const roll = Math.random();
        if (column >= 5 && index === 0) return 'elite';
        if (roll < 0.44) return 'battle';
        if (roll < 0.59) return 'elite';
        if (roll < 0.73) return 'event';
        if (roll < 0.86) return 'merchant';
        return 'camp';
      }
    
      completeNode(nodeId: string, hp?: number): void {
        const run = this.requireRun();
        if (hp !== undefined) run.hp = Math.max(0, Math.min(run.maxHp, hp));
        if (!run.completedNodeIds.includes(nodeId)) run.completedNodeIds.push(nodeId);
        const node = run.map.find((candidate) => candidate.id === nodeId);
        if (!node) return;
        node.visited = true;
        run.currentNodeId = nodeId;
        run.map.forEach((candidate) => {
          candidate.available = node.links.includes(candidate.id);
          if (candidate.column <= node.column + 2) candidate.revealed = true;
        });
        this.state.meta.bestColumn = Math.max(this.state.meta.bestColumn, node.column);
      }
    
      finishRun(victory: boolean): { wood: number; stone: number; blueprints: number } {
        const run = this.requireRun();
        const columns = Math.max(...run.completedNodeIds.map((id) => run.map.find((node) => node.id === id)?.column ?? 0), 0);
        const reward = {
          wood: 4 + columns * 2 + Math.floor(run.gold / 120),
          stone: 2 + Math.floor(columns * 1.4),
          blueprints: (victory ? 4 : 0) + Math.floor(columns / 3)
        };
        this.state.meta.wood += reward.wood;
        this.state.meta.stone += reward.stone;
        this.state.meta.blueprints += reward.blueprints;
        if (victory) this.state.meta.victories += 1;
        this.state.run = null;
        return reward;
      }
    
      addItemToBag(itemId: string): boolean {
        const run = this.requireRun();
        const index = run.bag.findIndex((slot) => slot === null);
        if (index < 0) return false;
        const weight = this.currentWeight() + ITEMS[itemId].weight;
        if (weight > SQUIRES[run.squireId].maxWeight + (this.state.meta.buildings.guild ?? 0) * 1.5) return false;
        run.bag[index] = { uid: uid(itemId), itemId };
        return true;
      }
    
      removeItem(itemUid: string): InventoryItem | null {
        const run = this.requireRun();
        const bagIndex = run.bag.findIndex((item) => item?.uid === itemUid);
        if (bagIndex >= 0) {
          const item = run.bag[bagIndex];
          run.bag[bagIndex] = null;
          return item;
        }
        const equipIndex = run.equipment.findIndex((item) => item?.uid === itemUid);
        if (equipIndex >= 0) {
          const item = run.equipment[equipIndex];
          run.equipment[equipIndex] = null;
          return item;
        }
        return null;
      }
    
      placeInBag(item: InventoryItem): boolean {
        const run = this.requireRun();
        const index = run.bag.findIndex((slot) => slot === null);
        if (index < 0 || this.currentWeight() + ITEMS[item.itemId].weight > SQUIRES[run.squireId].maxWeight + (this.state.meta.buildings.guild ?? 0) * 1.5) return false;
        run.bag[index] = item;
        return true;
      }
    
      equipItem(item: InventoryItem, slotIndex: number): InventoryItem | null {
        const run = this.requireRun();
        const hero = HEROES[run.heroId];
        const definition = ITEMS[item.itemId];
        if (!definition.slot || hero.slots[slotIndex] !== definition.slot) return item;
        const previous = run.equipment[slotIndex];
        run.equipment[slotIndex] = item;
        return previous;
      }
    
      currentWeight(): number {
        const run = this.requireRun();
        return run.bag.reduce((sum, item) => sum + (item ? ITEMS[item.itemId].weight : 0), 0);
      }
    
      slotLabel(slot: EquipmentSlot): string {
        return ({ weapon: 'Оружие', shield: 'Щит', armor: 'Броня', helmet: 'Шлем', amulet: 'Амулет', ring: 'Кольцо', trinket: 'Реликт' })[slot];
      }
    
      getEncounterEnemies(type: string): string[] {
        if (type === 'boss') return ['pack_alpha', 'excommunicated_intendant', 'crypt_keeper'];
        const pool = type === 'elite' ? ENCOUNTER_POOLS.elite : ENCOUNTER_POOLS.battle;
        const count = type === 'elite' ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 3);
        return Phaser.Math.RND.shuffle([...pool]).slice(0, count);
      }
    */
    requireRun(): RunState {
        if (!this.state.run) throw new Error('Run is not active');
        return this.state.run;
    }
}
/*
import { ENCOUNTER_POOLS } from '../data/Enemies';
import { ITEMS } from '../data/items';
import { EquipmentSlot, HeroId, InventoryItem, MapNodeState, SquireId } from '../entities/Types';

export interface MetaState {
  wood: number;
  stone: number;
  blueprints: number;
  buildings: Record<string, number>;
  bestColumn: number;
  victories: number;
}

export interface RunState {
  active: boolean;
  heroId: HeroId;
  squireId: SquireId;
  hp: number;
  maxHp: number;
  xp: number;
  level: number;
  trainingPoints: number;
  gold: number;
  equipment: (InventoryItem | null)[];
  bag: (InventoryItem | null)[];
  map: MapNodeState[];
  currentNodeId: string;
  completedNodeIds: string[];
  seed: number;
}

export interface StoredGameState {
  meta: MetaState;
  run: RunState | null;
}

const emptyMeta = (): MetaState => ({
  wood: 0,
  stone: 0,
  blueprints: 0,
  buildings: { forge: 0, guild: 0, tavern: 0, market: 0 },
  bestColumn: 0,
  victories: 0
});

const uid = (itemId: string) => `${itemId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

class GameStateStore {
  state: StoredGameState = { meta: emptyMeta(), run: null };

  resetAll(): void {
    this.state = { meta: emptyMeta(), run: null };
  }

  hydrate(state: StoredGameState): void {
    this.state = state;
    this.normalizeStartLinks();
  }

  startRun(heroId: HeroId, squireId: SquireId): void {
    const hero = HEROES[heroId];
    const squire = SQUIRES[squireId];
    const forge = this.state.meta.buildings.forge ?? 0;
    const tavern = this.state.meta.buildings.tavern ?? 0;
    const guild = this.state.meta.buildings.guild ?? 0;
    const market = this.state.meta.buildings.market ?? 0;
    const maxHp = hero.baseStats.maxHp + tavern * 8;
    const bagSlots = squire.bagSlots + guild;
    this.state.run = {
      active: true,
      heroId,
      squireId,
      hp: maxHp,
      maxHp,
      xp: 0,
      level: 1,
      trainingPoints: 0,
      gold: 50 + market * 10,
      equipment: hero.slots.map((slot, index) => {
        if (index === 0 && slot === 'weapon') return { uid: uid('rusty_falchion'), itemId: 'rusty_falchion' };
        return null;
      }),
      bag: Array.from({ length: bagSlots }, (_, index) => {
        if (index === 0) return { uid: uid('life_elixir'), itemId: 'life_elixir' };
        if (index === 1) return { uid: uid('henbane_extract'), itemId: 'henbane_extract' };
        return null;
      }),
      map: this.generateMap(1 + forge),
      currentNodeId: 'n0-1',
      completedNodeIds: [],
      seed: Math.floor(Math.random() * 999999)
    };
  }

  generateMap(extraBranches: number): MapNodeState[] {
    const nodes: MapNodeState[] = [{ id: 'n0-1', column: 0, row: 1, type: 'start', links: [], visited: true, available: true, revealed: true }];
    const columnRows = new Map<number, number[]>();
    columnRows.set(0, [1]);
    for (let c = 1; c <= 7; c += 1) {
      const count = c === 7 ? 1 : c === 1 ? 4 : Math.min(4, 2 + Math.floor(Math.random() * (2 + Math.min(extraBranches, 2))));
      const rows = c === 7 ? [1] : c === 1 ? [0, 1, 2, 3] : Phaser.Math.RND.shuffle([0, 1, 2, 3]).slice(0, count).sort((a, b) => a - b);
      columnRows.set(c, rows);
      rows.forEach((row, i) => {
        const type = c === 7 ? 'boss' : this.pickNodeType(c, i);
        nodes.push({ id: `n${c}-${row}`, column: c, row, type, links: [], visited: false, available: false, revealed: c <= 2 });
      });
    }
    for (let c = 0; c < 7; c += 1) {
      const fromRows = columnRows.get(c) ?? [];
      const toRows = columnRows.get(c + 1) ?? [];
      fromRows.forEach((row) => {
        const from = nodes.find((node) => node.id === `n${c}-${row}`);
        if (!from) return;
        const sorted = [...toRows].sort((a, b) => Math.abs(a - row) - Math.abs(b - row));
        const linkRows = c === 0 ? sorted : sorted.slice(0, Math.min(2, sorted.length));
        from.links = linkRows.map((targetRow) => `n${c + 1}-${targetRow}`);
      });
    }
    nodes.find((node) => node.id === 'n0-1')?.links.forEach((id) => {
      const node = nodes.find((candidate) => candidate.id === id);
      if (node) node.available = true;
    });
    return nodes;
  }

  normalizeStartLinks(): void {
    const run = this.state.run;
    if (!run) return;
    const start = run.map.find((node) => node.id === 'n0-1' || node.type === 'start');
    if (!start) return;
    const firstColumn = run.map.filter((node) => node.column === 1).map((node) => node.id);
    start.links = firstColumn;
    if (run.currentNodeId === start.id) {
      run.map.forEach((node) => {
        node.available = node.column === 1 || node.id === start.id;
        if (node.column <= 2) node.revealed = true;
      });
    }
  }

  pickNodeType(column: number, index: number): MapNodeState['type'] {
    if (column === 1) return 'battle';
    const roll = Math.random();
    if (column >= 5 && index === 0) return 'elite';
    if (roll < 0.44) return 'battle';
    if (roll < 0.59) return 'elite';
    if (roll < 0.73) return 'event';
    if (roll < 0.86) return 'merchant';
    return 'camp';
  }

  completeNode(nodeId: string, hp?: number): void {
    const run = this.requireRun();
    if (hp !== undefined) run.hp = Math.max(0, Math.min(run.maxHp, hp));
    if (!run.completedNodeIds.includes(nodeId)) run.completedNodeIds.push(nodeId);
    const node = run.map.find((candidate) => candidate.id === nodeId);
    if (!node) return;
    node.visited = true;
    run.currentNodeId = nodeId;
    run.map.forEach((candidate) => {
      candidate.available = node.links.includes(candidate.id);
      if (candidate.column <= node.column + 2) candidate.revealed = true;
    });
    this.state.meta.bestColumn = Math.max(this.state.meta.bestColumn, node.column);
  }

  finishRun(victory: boolean): { wood: number; stone: number; blueprints: number } {
    const run = this.requireRun();
    const columns = Math.max(...run.completedNodeIds.map((id) => run.map.find((node) => node.id === id)?.column ?? 0), 0);
    const reward = {
      wood: 4 + columns * 2 + Math.floor(run.gold / 120),
      stone: 2 + Math.floor(columns * 1.4),
      blueprints: (victory ? 4 : 0) + Math.floor(columns / 3)
    };
    this.state.meta.wood += reward.wood;
    this.state.meta.stone += reward.stone;
    this.state.meta.blueprints += reward.blueprints;
    if (victory) this.state.meta.victories += 1;
    this.state.run = null;
    return reward;
  }

  addItemToBag(itemId: string): boolean {
    const run = this.requireRun();
    const index = run.bag.findIndex((slot) => slot === null);
    if (index < 0) return false;
    const weight = this.currentWeight() + ITEMS[itemId].weight;
    if (weight > SQUIRES[run.squireId].maxWeight + (this.state.meta.buildings.guild ?? 0) * 1.5) return false;
    run.bag[index] = { uid: uid(itemId), itemId };
    return true;
  }

  removeItem(itemUid: string): InventoryItem | null {
    const run = this.requireRun();
    const bagIndex = run.bag.findIndex((item) => item?.uid === itemUid);
    if (bagIndex >= 0) {
      const item = run.bag[bagIndex];
      run.bag[bagIndex] = null;
      return item;
    }
    const equipIndex = run.equipment.findIndex((item) => item?.uid === itemUid);
    if (equipIndex >= 0) {
      const item = run.equipment[equipIndex];
      run.equipment[equipIndex] = null;
      return item;
    }
    return null;
  }

  placeInBag(item: InventoryItem): boolean {
    const run = this.requireRun();
    const index = run.bag.findIndex((slot) => slot === null);
    if (index < 0 || this.currentWeight() + ITEMS[item.itemId].weight > SQUIRES[run.squireId].maxWeight + (this.state.meta.buildings.guild ?? 0) * 1.5) return false;
    run.bag[index] = item;
    return true;
  }

  equipItem(item: InventoryItem, slotIndex: number): InventoryItem | null {
    const run = this.requireRun();
    const hero = HEROES[run.heroId];
    const definition = ITEMS[item.itemId];
    if (!definition.slot || hero.slots[slotIndex] !== definition.slot) return item;
    const previous = run.equipment[slotIndex];
    run.equipment[slotIndex] = item;
    return previous;
  }

  currentWeight(): number {
    const run = this.requireRun();
    return run.bag.reduce((sum, item) => sum + (item ? ITEMS[item.itemId].weight : 0), 0);
  }

  slotLabel(slot: EquipmentSlot): string {
    return ({ weapon: 'Оружие', shield: 'Щит', armor: 'Броня', helmet: 'Шлем', amulet: 'Амулет', ring: 'Кольцо', trinket: 'Реликт' })[slot];
  }

  getEncounterEnemies(type: string): string[] {
    if (type === 'boss') return ['pack_alpha', 'excommunicated_intendant', 'crypt_keeper'];
    const pool = type === 'elite' ? ENCOUNTER_POOLS.elite : ENCOUNTER_POOLS.battle;
    const count = type === 'elite' ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 3);
    return Phaser.Math.RND.shuffle([...pool]).slice(0, count);
  }

  requireRun(): RunState {
    if (!this.state.run) throw new Error('Run is not active');
    return this.state.run;
  }
}
*/
export const GameState = new GameStateStore();
