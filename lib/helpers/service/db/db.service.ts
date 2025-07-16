import { webSocketService } from "../websocket.service";
import { IDBPDatabase, openDB } from "idb";

export class MonitorGroupDB {
  private readonly dbName = "MonitorGroupsDB";
  private readonly dbVersion = 1;
  private db!: IDBPDatabase<DBSchema>;

  private readyPromise: Promise<void> | null = null;
  private isInitializing = false;

  async initialize(): Promise<void> {
    if (this.db || this.isInitializing) return this.readyPromise!; // already initialized
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      console.warn("IndexedDB not available in this environment.");
      return;
    }

    this.isInitializing = true;
    this.readyPromise = (async () => {
      this.db = await openDB<DBSchema>(this.dbName, this.dbVersion, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("groups")) {
            db.createObjectStore("groups", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("devices")) {
            db.createObjectStore("devices", { keyPath: "SystemMonitorId" });
          }
        },
      });
    })();

    await this.readyPromise;
    this.isInitializing = false;

    // this.db = await openDB<DBSchema>(this.dbName, this.dbVersion, {
    //   upgrade(db) {
    //     if (!db.objectStoreNames.contains("groups")) {
    //       const store = db.createObjectStore("groups", { keyPath: "id" });
    //       store.createIndex("name", "name", { unique: true });
    //     }

    //     if (!db.objectStoreNames.contains("devices")) {
    //       const store = db.createObjectStore("devices", {
    //         keyPath: "SystemMonitorId",
    //       });
    //       store.createIndex("name", "Name");
    //     }
    //   },
    // });

    this.setupWebSocketListeners();
  }

  private async waitForReady(): Promise<void> {
    if (this.db) return;
    await this.initialize();
  }

  private setupWebSocketListeners() {
    webSocketService.subscribe("deviceUpdate", async (device: BaseMonitor) => {
      await this.db.put("devices", device);
    });

    webSocketService.subscribe("groupUpdate", async (group: MonitorGroup) => {
      await this.db.put("groups", { ...group, updatedAt: new Date() });
    });

    webSocketService.subscribe("groupCreated", async (group: MonitorGroup) => {
      await this.db.add("groups", group);
    });

    webSocketService.subscribe("groupDeleted", async (groupId: string) => {
      await this.db.delete("groups", groupId);
    });
  }

  async addGroup(
    group: Omit<MonitorGroup, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const completeGroup: MonitorGroup = {
      ...group,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.add("groups", completeGroup);
    webSocketService.send("groupCreated", completeGroup);
    return completeGroup.id;
  }

  async updateGroup(group: MonitorGroup): Promise<void> {
    const updatedGroup = { ...group, updatedAt: new Date() };
    await this.db.put("groups", updatedGroup);
    webSocketService.send("groupUpdated", updatedGroup);
  }

  async getGroup(id: string): Promise<MonitorGroup | undefined> {
    return this.db.get("groups", id);
  }

  async getAllGroups(): Promise<MonitorGroup[]> {
    return this.db.getAll("groups");
  }

  async deleteGroup(id: string): Promise<void> {
    await this.db.delete("groups", id);
    webSocketService.send("groupDeleted", id);
  }

  async addDevices(devices: BaseMonitor[]): Promise<void> {
    await this.waitForReady();
    if (!this.db) {
      console.warn("IndexedDB is not initialized. Skipping addDevices.");
      return;
    }

    const tx = this.db.transaction("devices", "readwrite");
    const store = tx.objectStore("devices");
    for (const device of devices) {
      await store.put(device);
      // webSocketService.send("deviceUpdated", device);
    }
    await tx.done;
  }

  async removeDevices(): Promise<void> {
    return this.db.deleteObjectStore("MonitorGroupsDB");
  }

  async getAllDevices(): Promise<BaseMonitor[]> {
    return this.db.getAll("devices");
  }

  async getDevicesByIds(ids: string[]): Promise<BaseMonitor[]> {
    const results: BaseMonitor[] = [];
    for (const id of ids) {
      const device = await this.db.get("devices", id);
      if (device) results.push(device);
    }
    return results;
  }
}

export const db = new MonitorGroupDB();
