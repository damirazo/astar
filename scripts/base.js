window.onload = function (event) {

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    // размер ячейки
    var cellSize = 10;
    // количество ячеек по высоте
    var rows = 50;
    // количество ячеек по ширине
    var cols = 50;
    // стартовая позиция
    var startPoint = [1, 1];
    var endPoint = [49, 49];
    // возможно ли перемещаться в диагональные клетки?
    var diagonaleMove = false;
    // шанс генерации препятствия
    var obstacleChance = 10;

    // задаем высоту и ширину полю канваса
    canvas.height = cellSize * rows;
    canvas.width = cellSize * cols;

    // типы блоков
    var Block = {
        // пустой блок
        Air:0,
        // блок препятствия
        Obstacle:1,
        // блок игрока или посещенной им клетки
        Player:2
    };

    // цвета блоков
    var BlockColor = {
        0:'#ffffff',
        1:'#252525',
        2:'#cc0000'
    };

    // получаем случайное число
    function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // генерируем карту
    function generateMap() {
        var map = [];
        for (var y = 0; y < rows; y++) {
            map[y] = [];
            for (var x = 0; x < cols; x++) {
                if (x == startPoint[0] && y == startPoint[1]) {
                    map[y][x] = Block.Player;
                }
                else {
                    map[y][x] = (random(0, 100) < obstacleChance) ? Block.Obstacle : Block.Air;
                }
            }
        }
        return map;
    }

    // прорисовка карты
    function drawMap(map) {
        context.clearRect(0, 0, cols * cellSize, rows * cellSize);
        for (var y = 0; y < map.length; y++) {
            for (var x = 0; x < map[y].length; x++) {
                context.fillStyle = BlockColor[map[y][x]];
                context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    // возвращает соседние ячейки по их индексу
    function getCellByAlias(position, alias) {
        switch(alias) {
            // top left
            case 0: return [position[0] - 1, position[1] - 1];
            // top
            case 1: return [position[0], position[1] - 1];
            // top right
            case 2: return [position[0] + 1, position[1] - 1];
            // right
            case 3: return [position[0] + 1, position[1]];
            // bottom right
            case 4: return [position[0] + 1, position[1] + 1];
            // bottom
            case 5: return [position[0], position[1] + 1];
            // bottom left
            case 6: return [position[0] - 1, position[1] + 1];
            // left
            case 7: return [position[0] - 1, position[1]];
            // center
            default: return position;
        }
    }

    // возвращает дистанцию между центрами ячеек
    function distanceToPoint(firstCell, secondCell) {
        var firstCellCenter = [firstCell[0] * cellSize - (cellSize / 2), firstCell[1] * cellSize - (cellSize / 2)];
        var secondCellCenter = [secondCell[0] * cellSize - (cellSize / 2), secondCell[1] * cellSize - (cellSize / 2)];
        return Math.sqrt(
            Math.pow(secondCellCenter[0] - firstCellCenter[0], 2) + Math.pow(secondCellCenter[1] - firstCellCenter[1], 2)
        )
    }

    // возвращает самую "легкую" ячейку
    function getLightWeight(currentPosition, endPosition, map) {
        // вес диагональных ячеек
        var diagonaleWeight = (diagonaleMove === true) ? 1 : 10;
        // вес ячеек с препятствиями
        var obstacleWeight = 10;
        // вес посещенных ячеек
        var playerWeight = 50;
        var lightCellValue = 9999;
        var lightCellElement;
        for (var i=0; i<8; i++) {
            var cell = getCellByAlias(currentPosition, i);
            var distance = distanceToPoint(endPosition, cell);
            var blockType = map[cell[1]][cell[0]];
            var weight;
            switch(blockType) {
                case 0: weight = distance; break;
                case 1: continue;
                case 2: weight = distance * playerWeight; break;
                default: continue;
            }
            if (i == 0 || i == 2 || i == 4 || i == 6) {
                weight = weight * diagonaleWeight;
            }
            if (weight < lightCellValue) {
                lightCellValue = weight;
                lightCellElement = cell;
            }
        }
        return lightCellElement;
    }

    // производит поиск маршрута
    function searchRoute(currentPosition, endPosition, map) {
        var newPosition = getLightWeight(currentPosition, endPosition, map);
        startPoint = newPosition;
        map[newPosition[1]][newPosition[0]] = Block.Player;
        return map;
    }

    // генерируем массив карты
    var map = window.map_object;

    var interval = window.setInterval(function() {
        map = searchRoute(startPoint, endPoint, map);
        drawMap(map);
        if (startPoint[0] == endPoint[0] && startPoint[1] == endPoint[1]) {
            alert('Маршрут найден!');
            window.clearInterval(interval);
        }
    }, 1000 / 100);

};