class Container {
    constructor(ID, weight) {
        this.ID = ID;
        this.weight = weight;
    }

    consumption() {

    }

    equals(other) {
        return this.constructor === other.constructor
            && this.ID === other.ID && this.weight === other.weight;
    }
    toJSON() {
        return { ID: this.ID, weight: this.weight };
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

class IShip {

}

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

class IPort {

}

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

const fs = require('fs');

class Main {
    static main() {
        const input = JSON.parse(fs.readFileSync('actions.json', 'utf8'));

        const port1 = new Port(input.port1.ID, input.port1.latitude, input.port1.longitude);
        const port2 = new Port(input.port2.ID, input.port2.latitude, input.port2.longitude);

        const ship1 = new Ship(
            input.ship1.ID,
            input.ship1.fuel,
            port1,
            input.ship1.totalWeightCapacity,
            input.ship1.maxNumberOfAllContainers,
            input.ship1.maxNumberOfHeavyContainers,
            input.ship1.maxNumberOfRefrigeratedContainers,
            input.ship1.maxNumberOfLiquidContainers,
            input.ship1.fuelConsumptionPerKM
        );

        const ship2 = new Ship(
            input.ship2.ID,
            input.ship2.fuel,
            port1,
            input.ship2.totalWeightCapacity,
            input.ship2.maxNumberOfAllContainers,
            input.ship2.maxNumberOfHeavyContainers,
            input.ship2.maxNumberOfRefrigeratedContainers,
            input.ship2.maxNumberOfLiquidContainers,
            input.ship2.fuelConsumptionPerKM
        );

        const container1 = new BasicContainer(input.container1.ID, input.container1.weight);
        const container2 = new RefrigeratedContainer(input.container2.ID, input.container2.weight);

        ship1.containers.push(container1);
        ship2.containers.push(container2);

        port1.incomingShip(ship1);
        port1.incomingShip(ship2);

        console.log(JSON.stringify(port1.toJSON(), null, 2));
        console.log(JSON.stringify(port2.toJSON(), null, 2));
    }
}

Main.main();