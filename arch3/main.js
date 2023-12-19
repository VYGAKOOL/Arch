class Container {
    constructor(ID, weight) {
        this.ID = ID;
        this.weight = weight;
    }

    equals(other) {
        return this.constructor === other.constructor
            && this.ID === other.ID && this.weight === other.weight;
    }

    toJSON() {
        return { ID: this.ID, weight: this.weight };
    }
}

class ItemFactory {
    createSmallItem(ID, weight, count, containerID) {
        return new Small(ID, weight, count, containerID);
    }

    createHeavyItem(ID, weight, count, containerID) {
        return new Heavy(ID, weight, count, containerID);
    }

    createRefrigeratedItem(ID, weight, count, containerID) {
        return new Refrigerated(ID, weight, count, containerID);
    }

    createLiquidItem(ID, weight, count, containerID) {
        return new Liquid(ID, weight, count, containerID);
    }
}

class ShipBuilder {
    constructor() {
        this.ship = null;
    }

    buildLightWeightShip(ID, fuel, currentPort, totalWeightCapacity, maxContainers) {
        this.ship = new Ship(ID, fuel, currentPort, totalWeightCapacity, maxContainers);
        return this;
    }

    buildMediumShip(ID, fuel, currentPort, totalWeightCapacity, maxContainers, fuelConsumptionPerKM) {
        this.ship = new MediumShip(ID, fuel, currentPort, totalWeightCapacity, maxContainers, fuelConsumptionPerKM);
        return this;
    }

    buildHeavyShip(ID, fuel, currentPort, totalWeightCapacity, maxContainers, fuelConsumptionPerKM, fuelBank) {
        this.ship = new HeavyShip(ID, fuel, currentPort, totalWeightCapacity, maxContainers, fuelConsumptionPerKM, fuelBank);
        return this;
    }

    addContainer(container) {
        this.ship.containers.push(container);
        return this;
    }

    getShip() {
        return this.ship;
    }
}

class BasicContainer extends Container {
    constructor(ID, weight) {
        super(ID, weight);
    }

    consumption() {
        return 2.50 * this.weight;
    }
}

class HeavyContainer extends Container {
    constructor(ID, weight) {
        super(ID, weight);
    }

    consumption() {
        return 3.00 * this.weight;
    }
}

class RefrigeratedContainer extends HeavyContainer {
    constructor(ID, weight) {
        super(ID, weight);
    }

    consumption() {
        return 5.00 * this.weight;
    }
}

class LiquidContainer extends HeavyContainer {
    constructor(ID, weight) {
        super(ID, weight);
    }

    consumption() {
        return 4.00 * this.weight;
    }
}

class Small extends Container {
    constructor(ID, weight, count, containerID) {
        super(ID, weight);
        this.count = count;
        this.containerID = containerID;
    }
}

class Heavy extends Container {
    constructor(ID, weight, count, containerID) {
        super(ID, weight);
        this.count = count;
        this.containerID = containerID;
    }
}

class IShip {}

class Ship extends IShip {
    constructor(ID, fuel, currentPort, totalWeightCapacity, maxNumberOfAllContainers, maxNumberOfHeavyContainers, maxNumberOfRefrigeratedContainers, maxNumberOfLiquidContainers, fuelConsumptionPerKM) {
        super();
        this.ID = ID;
        this.fuel = fuel;
        this.currentPort = currentPort;
        this.totalWeightCapacity = totalWeightCapacity;
        this.maxNumberOfAllContainers = maxNumberOfAllContainers;
        this.maxNumberOfHeavyContainers = maxNumberOfHeavyContainers;
        this.maxNumberOfRefrigeratedContainers = maxNumberOfRefrigeratedContainers;
        this.maxNumberOfLiquidContainers = maxNumberOfLiquidContainers;
        this.fuelConsumptionPerKM = fuelConsumptionPerKM;
        this.containers = [];
    }

    getCurrentContainers() {
        return this.containers;
    }

    toJSON() {
        return {
            Ship: this.ID,
            fuel: this.fuel,
            totalWeightCapacity: this.totalWeightCapacity,
            containers: this.containers.map(container => container.toJSON())
        };
    }
}

class IPort {}

class Port extends IPort {
    constructor(ID, latitude, longitude) {
        super();
        this.ID = ID;
        this.latitude = latitude;
        this.longitude = longitude;
        this.containers = [];
        this.history = [];
        this.current = [];
    }

    incomingShip(ship) {
        // Checking if the ship has enough fuel to reach the port
        if (this.getDistance(ship.currentPort) * ship.fuelConsumptionPerKM > ship.fuel) {
            throw new Error('Not enough fuel to reach the port.');
        }

        // Decreasing the ship's fuel
        ship.fuel -= this.getDistance(ship.currentPort) * ship.fuelConsumptionPerKM;

        // Adding the ship to the history and current ships of the port
        this.history.push(ship);
        this.current.push(ship);

        // Transferring containers from the ship to the port
        this.containers = this.containers.concat(ship.containers);

        // Clearing the ship's containers
        ship.containers = [];
    }

    outgoingShip(ship) {
        // Checking if the ship is currently in the port
        if (!this.current.includes(ship)) {
            throw new Error('The ship is not currently in the port.');
        }

        // Transferring containers from the port to the ship
        ship.containers = ship.containers.concat(this.containers);

        // Clearing the port's containers
        this.containers = [];

        // Removing the ship from the current ships of the port
        ship.containers = ship.containers.concat(this.containers);
    }

    getDistance(other) {
        const earthRadius = 6371;
        const lat1 = this.latitude;
        const lon1 = this.longitude;
        const lat2 = other.latitude;
        const lon2 = other.longitude;

        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);

        const a =
            0.5 -
            Math.cos(dLat) / 2 +
            (Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * (1 - Math.cos(dLon))) / 2;

        return 2 * earthRadius * Math.asin(Math.sqrt(a));
    }

    toJSON() {
        return {
            Port: this.ID,
            latitude: this.latitude,
            longitude: this.longitude,
            containers: this.containers.map(container => container.toJSON()),
            history: this.history.map(ship => ship.toJSON()),
            current: this.current.map(ship => ship.toJSON())
        };
    }
}

const port1 = new Port(1, 40.7128, -74.0060);
const port2 = new Port(2, 34.0522, -118.2437);

const itemFactory = new ItemFactory();
const smallItem = itemFactory.createSmallItem(1, 10, 2, 100);
const heavyItem = itemFactory.createHeavyItem(2, 30, 1, 101);

const shipBuilder = new ShipBuilder();
const lightWeightShip = shipBuilder
    .buildLightWeightShip(1, 100, port1, 2000, 10)
    .addContainer(smallItem)
    .addContainer(heavyItem)
    .getShip();

port1.incomingShip(lightWeightShip);
