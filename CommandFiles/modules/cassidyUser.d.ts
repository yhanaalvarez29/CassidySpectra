declare module "cassidy-userData" {
  type InventoryTypes =
    | "generic"
    | "weapon"
    | "armor"
    | "key"
    | "food"
    | "anypet_food"
    | `${string}_food`;

  type BaseInventoryItem = {
    key: string;
    name: string;
    flavorText: string;
    icon: string;
    sellPrice?: number;
    type: InventoryTypes;
    /**
     * @deprecated
     */
    index: number;
  };

  type WeaponInventoryItem = {
    atk: number;
    def?: number;
    magic?: number;
    type: "weapon";
  };

  type ArmorInventoryItem = {
    atk?: number;
    def: number;
    magic?: number;
    type: "armor";
  };

  type PetUncaged = {
    name: string;
    key: string;
    flavorText: string;
    icon: string;
    type: "pet";
    sellPrice: number;
    cannotToss: false;
    petType: string;
    level: number;
    lastFeed: number;
    lastExp: number;
    lastSaturation: number;
    lastFoodEaten: string;
  };

  type InventoryItem =
    | (BaseInventoryItem & WeaponInventoryItem)
    | (BaseInventoryItem & ArmorInventoryItem)
    | BaseInventoryItem;

  type UserData = {
    money: number;
    userID?: string;
    inventory?: InventoryItem[];
    petsData?: InventoryItem & PetUncaged;
    /**
     * @deprecated
     */
    exp: number;
    name?: string | "Unregistered";
    lastModified?: number;
  };

  type NullableUserData = {
    [K in keyof UserData]: UserData[K] | null;
  };

  export {
    UserData,
    InventoryItem,
    BaseInventoryItem,
    ArmorInventoryItem,
    WeaponInventoryItem,
    InventoryTypes,
    NullableUserData,
  };
}
