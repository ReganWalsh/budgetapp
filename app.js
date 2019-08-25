var budgetController = (function() { //Separating Controllers Into Modules, We Will Return All The Functions We Need To Use (Separation Of Concerns)

    var Expense = function(id, description, value) { //Method Containing All Values We Need For Expenses
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1; //Initialising Percentage As < 0
    };

    Expense.prototype.calculatePercentage = function(totalIncome) { //Adding calcPercentage Function To Prototype Of Expense Constructor
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() { //Adding getPercentage Function To Prototype Of Expense Constructor
        return this.percentage;
    };

    var Income = function(id, description, value) { //Constructor Containing All Values We Need For Incomes
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) { //Function Declaration To Calculate Total For Total Of All Values, Takes Income/Expense As Parameter
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value; //Cumulative Total For All Incomes/Expenses
        });
        data.totals[type] = sum; //Add This Total To Totals In Array
        /*
        i.e
        [200, 400, 100]
        sum = 0 + 200
        sum = 200 + 400
        sum = 600 + 100 = 700
        totals[type] = 700
         */
    };

    var data = { //Data Object For Containing All Information About Fields Of App
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 //Comparing Percentage Later < 0, -1 === null
    };

    return { //Return All Functions That Need Outside Of Controller
        allItems: function(type, des, val) { //Function To Return All Items Of A Particular Type Taking Type, Description And Value As Parameters
            var newItem, ID;
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1; //Creates ID For New Item
            } else {
                ID = 0;
            }
            if (type === 'exp'){ ///Creates New Expense Item
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){ //Creates New Income Item
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem); //Pushes Item To End Of Income/Expense Array
            return newItem;
        },

        deleteItem: function(type, id) { //Function That Deletes A Particular Item, Taking Type And ID As Parameters
            var index;
            var ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1); //Removes Item From Array
            }
        },

        calculateBudget: function() { //Calculate Total Incomes And Expenses
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp; //Calculate Budget: Income - Expenses
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); //Calculate The Percentage Of Income That Has Been Spent
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function (cur) {
                cur.calculatePercentage(data.totals.inc); //Calculate Percentage For Each Expense
            });
        },

        getPercentages: function () { //Get Percentages For Expenses
            allPercentages = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPercentages; //Return Percentage For All Items
        },

        getBudget: function() { //Get Total Budget
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage
            }
        },

    };
})(); //Call Controller Itself

var UIController = (function() { //Separation Of Concerns
    var domStrings = { //Object Literals For HTML Elements
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) { //Format Number Into Currency
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);//input 2310 === 2,310
        }
        dec = numSplit[1];
        return (type === 'exp' ? '-': '+') + ' ' + int + '.' + dec; //Returns Final Value
    };

    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () { //Get Income From User
            return {
                type: document.querySelector(domStrings.inputType).value, //Either Income Or Expense
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            //Create HTML String With Placeholder Text
            if(type === 'inc') {
                element = domStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn">' +
                    '<i class="ion-ios-close-outline"></i>' +
                    '</button></div></div></div>'
            } else {
                element = domStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__percentage">21%</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn">' +
                    '<i class="ion-ios-close-outline"></i>' +
                    '</button></div></div></div>'
            }

            //Replace The Placeholder Text With Actual Data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value));

            //Insert The HTML Into The DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml); //'beforeend' Insert Inside The Element, After Its Last Child
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID); //Select The Element
            el.parentNode.removeChild(el); //Remove The Element
        },

        clearFields: function() { //Clear Fields Of Form When An Item Has Just Been Created
            var fields, fieldsArr;
            fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current){
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget);
            document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalIncome);
            document.querySelector(domStrings.expenseLabel).textContent = formatNumber(obj.totalExpense);

            if(obj.percentage > 0){
                document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(domStrings.percentageLabel).textContent = "_"
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(domStrings.expensesPercentageLabel); //Returns NodeList
            nodeListForEach(fields, function (current, index) {
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '_'
                }
            });
        },

        displayMonth: function () {
            var now, year, month, months;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month =  now.getMonth();
            year = now.getFullYear();
            document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' + year; //Displays Month And Year
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                domStrings.inputType + ',' +
                domStrings.inputDescription + ',' +
                domStrings.inputValue);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(domStrings.inputButton).classList.toggle('red');
        },

        getDOMStrings: function() {
            return domStrings;
        }
    };
})(); //Call Controller Itself

var controller = (function(budgetCtrl, UICtrl) {
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) { //Corresponds To Enter Key
                ctrlAddItem(); //Adds Item When Enter Key Is Pressed
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        budgetCtrl.calculateBudget(); //Calculate Budget
        var budget = budgetCtrl.getBudget(); //Return Budget
        UICtrl.displayBudget(budget); //Display Budget In The UI
    };

    var updatePercentages = function() {
        budgetCtrl.calculatePercentages(); //Calculate Percentages
        var percentages = budgetCtrl.getPercentages(); //Read Percentages From The Budget Controller
        UICtrl.displayPercentages(percentages); //Update The UI With The New Percentages
    };

    var ctrlAddItem = function() {
        var input, newItem;
        input = UICtrl.getInput(); //Get Input Data

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.allItems(input.type, input.description, input.value); //Add The Item To The Budget Controller

            UICtrl.addListItem(newItem, input.type); //Add Item To UI
            UICtrl.clearFields();
            updateBudget(); //Calculate And Update budget
            updatePercentages(); //Calculate And Update Percentages
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetCtrl.deleteItem(type, ID); //Delete The Item From The Data Structure
            UICtrl.deleteListItem(itemID); //Delete The Item From The User Interface
            updateBudget(); //Update And Show The New Budget
            updatePercentages(); //Calculate And Update Percentages
        }
    };

    return {
        init: function() {
            console.log('Application Has Started......');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController); //Calls All Controllers
controller.init(); //Starts Event Listeners
