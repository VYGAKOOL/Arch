class Main {
    constructor() {
        this.customers = [];
        this.operators = [];
        this.bills = [];
    }

    createCustomer(ID, name, age, limitingAmount) {
        const customer = new Customer(ID, name, age, this.operators, limitingAmount);
        this.customers.push(customer);
        return customer;
    }

    createOperator(ID, talkingCharge, messageCost, networkCharge, discountRate) {
        const operator = new Operator(ID, talkingCharge, messageCost, networkCharge, discountRate);
        this.operators.push(operator);
        return operator;
    }

    talk(customer1, customer2, minutes) {
        customer1.talk(minutes, customer2);
    }

    message(customer1, customer2, quantity) {
        customer1.message(quantity, customer2);
    }

    connectToInternet(customer, dataAmount) {
        customer.connectToInternet(dataAmount);
    }

    payBill(customer, amount) {
        customer.payBill(amount);
    }

    changeOperator(customer, operator) {
        customer.changeOperator(operator);
    }

    changeBillLimit(customer, amount) {
        customer.changeBillLimit(amount);
    }

    runActions(actions) {
        for (const action of actions) {
            const { type, params } = action;
            switch (type) {
                case 'createCustomer':
                    this.createCustomer(...params);
                    break;
                case 'createOperator':
                    this.createOperator(...params);
                    break;
                case 'talk':
                    this.talk(...params);
                    break;
                case 'message':
                    this.message(...params);
                    break;
                case 'connectToInternet':
                    this.connectToInternet(...params);
                    break;
                case 'payBill':
                    this.payBill(...params);
                    break;
                case 'changeOperator':
                    this.changeOperator(...params);
                    break;
                case 'changeBillLimit':
                    this.changeBillLimit(...params);
                    break;
                default:
                    console.log(`Invalid action type: ${type}`);
            }
        }
    }
}

class Customer {
    constructor(ID, name, age, operators, limitingAmount) {
        this.ID = ID;
        this.name = name;
        this.age = age;
        this.operators = operators;
        this.currentOperator = null;
        this.currentBill = null;
        this.changeOperator(operators[0]);
        this.changeBillLimit(limitingAmount);
    }

    talk(minutes, other) {
        const charge = this.currentOperator.calculateTalkingCost(minutes, this);
        if (this.currentBill.check(charge)) {
            this.currentBill.add(charge);
            console.log(`${this.name} talked to ${other.name} for ${minutes} minutes.`);
        } else {
            console.log(`${this.name} exceeded the bill limit.`);
        }
    }

    message(quantity, other) {
        const charge = this.currentOperator.calculateMessageCost(quantity, this, other);
        if (this.currentBill.check(charge)) {
            this.currentBill.add(charge);
            console.log(`${this.name} sent ${quantity} messages to ${other.name}.`);
        } else {
            console.log(`${this.name} exceeded the bill limit.`);
        }
    }

    connectToInternet(dataAmount) {
        const charge = this.currentOperator.calculateNetworkCost(dataAmount);
        if (this.currentBill.check(charge)) {
            this.currentBill.add(charge);
            console.log(`${this.name} connected to the internet for ${dataAmount} MB.`);
        } else {
            console.log(`${this.name} exceeded the bill limit.`);
        }
    }

    payBill(amount) {
        this.currentBill.pay(amount);
        console.log(`${this.name} paid ${amount} for the bill.`);
    }

    changeOperator(operator) {
        this.currentOperator = operator;
    }

    changeBillLimit(amount) {
        this.currentBill = new Bill(amount);
    }
}

class Operator {
    constructor(ID, talkingCharge, messageCost, networkCharge, discountRate) {
        this.ID = ID;
        this.talkingCharge = talkingCharge;
        this.messageCost = messageCost;
        this.networkCharge = networkCharge;
        this.discountRate = discountRate;
    }

    calculateTalkingCost(minutes, customer) {
        let charge = minutes * this.talkingCharge;
        if (customer.age < 18 || customer.age > 65) {
            charge *= (1 - this.discountRate / 100);
        }
        return charge;
    }

    calculateMessageCost(quantity, customer1, customer2) {
        let charge = quantity * this.messageCost;
        if (customer1.currentOperator === customer2.currentOperator) {
            charge *= (1 - customer1.currentOperator.discountRate / 100);
        }
        return charge;
    }

    calculateNetworkCost(dataAmount) {
        return dataAmount * this.networkCharge;
    }
}

class Bill {
    constructor(limitingAmount) {
        this.limitingAmount = limitingAmount;
        this.currentDebt = 0;
    }

    check(amount) {
        return this.currentDebt + amount <= this.limitingAmount;
    }

    add(amount) {
        this.currentDebt += amount;
    }

    pay(amount) {
        this.currentDebt -= amount;
    }
}
const fs = require('fs');
const main = new Main();
const actions = JSON.parse(fs.readFileSync('actions.json', 'utf8'));
const customer1 = main.createCustomer(0, 'Alice', 25, 100);
const customer2 = main.createCustomer(1, 'Bob', 30, 200);
const operator = main.createOperator(0, 0.1, 0.05, 0.01, 10);

customer1.changeOperator(operator);
customer2.changeOperator(operator);

main.runActions(actions);
