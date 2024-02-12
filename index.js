const Tree = require('./tree_data_mock.js');

function fillMapsAndVariable(idNodeMap, parentIdNodeMap, defaultParentId) {
    // не будем учитывать узлы без поля id или если id имеет значение
    // (например не учитываем узел с полем "iD")

    for (const node of Tree) {
        if (node.hasOwnProperty("id")) {
            idNodeMap[node.id] = node;
            if (node.default_parent) {
                Object.assign(defaultParentId, {
                    id: node.id
                });
            }
        }
    }

    for (const node of Tree) {
        if (!node.hasOwnProperty("default_parent") && node.hasOwnProperty("id")) {
            let parent_id = 9000;

            if (node.parent_id && idNodeMap[node.parent_id]) {
                parent_id = node.parent_id;
            }

            parentIdNodeMap[parent_id] = parentIdNodeMap[parent_id] || [];
            parentIdNodeMap[parent_id].push(node);
        }
    }
}

function valuePreprocessing(value) {
    if (typeof value === "string") {
        // попробуем заменить знак "," на знак "."
        value = parseFloat(value.replace(',', '.')) || 0;
    } else if (typeof value !== "number") {
        value = 0;
    }

    return parseFloat(value.toFixed(2));
}

function incValue(node_id, value_increment) {
    // если value_increment не положительное число, то выходим из функции
    if (value_increment <= 0) {
        console.log(`value_increment = ${node_id}. value_increment всегда должно быть положительным числом. Завершаю работу.`);
        return;
    }

    // const findNode = (id) => nodeMap[id];
    let workFlag = true;

    // Создаем ассоциативный массив для быстрого доступа к узлам по их идентификаторам
    const idNodeMap = {};
    const parentIdNodeMap = {};

    const defaultParentIdObj = {
        id: undefined
    };

    fillMapsAndVariable(idNodeMap, parentIdNodeMap, defaultParentIdObj);

    let defaultParentId = defaultParentIdObj.id;

    // если узел с таким id не существет, то выходим из функции
    if (idNodeMap[node_id] == undefined) {
        console.log(`Узел с id: ${node_id} не найден. Завершаю работу.`);
        return;
    }

    while (workFlag) {
        const node = idNodeMap[node_id];

        // сюда мы попадем только если это уже не первый узел и в этом случае мы переходим 
        if (node == undefined) {
            console.log(`Узел с id: ${node_id} не найден. Что-то пошло не так.
                         Возможно кто-то удалил узел к которому вы пытаетесь обратиться. Завершаю работу`);
        }

        // приводим node.value к числовому формату
        node.value = valuePreprocessing(node.value);
        // увеличим значение node.value
        node.value += value_increment;
        // приводим к виду в соответствии с заданием - число с плавающей точкой с двумя значащими цифрами после запятой
        //, хотя можно понять задание так,
        // что перед увеличением значения надо его также обрезать до двух знаков
        node.value = parseFloat(node.value.toFixed(2));

        // сохраним id текущего узла для того, чтобы исключить текущий узел из списка братских узлов
        let currentNodeId = node_id;
        // для перехода в родительский узел присваиваем переменной node_id значение node.parent_id
        // если node.parent_id не существует или указывает на несуществующий узед, то идем в корень дерева
        if (node.parent_id && idNodeMap[node.parent_id]) {
            node_id = node.parent_id;
        } else {
            node_id = defaultParentId;
        }

        // готовим value_increment для узлов братьев и следующего узла (родительского)
        value_increment_for_brothers = value_increment / 10;
        value_increment /= 4;

        // если мы были в коне дерева, то можно завершить работу
        if (node.default_parent) {
            workFlag = false;
            continue;
        }

        // изменяем значения node.value у братьев (если мы в корне дерева, то сюда не попадем)
        // node_id уже принял значение родительского узла
        let nodeBrothers = parentIdNodeMap[node_id];
        nodeBrothers.forEach(brother => {
            // 
            if (brother.id != currentNodeId) {
                // приводим brother.value к числовому формату
                brother.value = valuePreprocessing(brother.value);
                let realIncrementValue = value_increment_for_brothers < brother.value ? value_increment_for_brothers : brother.value;
                brother.value += realIncrementValue;
                // приводим к виду в соответствии с заданием, хотя тут как и выше, можно понять задание так,
                // что перед увеличением значения надо его также обрезать до двух знаков
                brother.value = parseFloat(brother.value.toFixed(2));
            }
        });
    }
}

// Test cases
incValue(303, 303);
incValue(1701, -1701);
incValue(9000, 9000);

// Print-out the result
console.log(JSON.stringify(Tree, null, "\t"));