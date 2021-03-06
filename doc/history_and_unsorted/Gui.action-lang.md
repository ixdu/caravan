[[gui.action lang specification]] - черновик спецификации

### Это черновик, рабочая портянка, по большей части поток сознания

Главные цели концепта:

* анимация 
* программирование логики работы интерфейса. 
Дополнительные цели: 
* реализация всей логики интерфейса 
* предобработка данных перед их отправкой сервисам, использующим ui. 
На данный момент, работа над дополнительными целями не ведётся и в ближайшее время вряд ли будет вестись:)

Концепт в общем то нагло содран с таких проектов как xul, gjs и QML(Qt Quck) и прежде всего QML, фактически это тоже самое, но более конвеерно подобное и без синтаксическо-семантического сахара.  Но тут вообще всё содрано, так что не обращаем внимание:)
Язык этот разработан так, чтобы:

* легко разбираться и перерабатываться широкораспространёнными средствами(фактически нужны только реализация json и javascript)
* чётко отделить код, ведомый данными, работающий по разному в зависимости от ситуации от кода, который легко может быть разложен в конвеер, либо в стили(на подобии css). Вот для второго типа кода и его оптимизации и создан action_lang. Чтобы эффективно его компилировать в нечто более-менее оптимальное под конкретной платформой, где работает gui-backend(например css для стилей и преобразований в web, clutter для преобразований в gtk и тд) 
* Кроссинструментально. Конечно есть шейдеры, конечно есть css, конечно есть что-нибудь ещё, предназначенное для описания эффектов, стиле, но хоть эти технологии и кроссплатформенны, они не итероперабельны или хрен его знает как это назвать. В общем они не могут использоваться одна над другой или под другой. Нам же нужен метаязык, который будет работать поверх той или иной технологии на целевой платформе. Можно заметить, что QML достаточно независим от Qt, и в принципе кандидат на эту роль, но будем честными - нет ресурсов сейчас брать и делать собственную реализацию столь масштабного проекта как QML, а оригинальный QML завязан на Qt всё равно, не концептуально, но реализацией.
* легко делать что-нибудь с элементами интерфейса, программировать их базовую логику, изменять их и тд.

Итак, во главе концепта стоят такие понятия состояния как:

* state(Состояние) 
Это некоторая строка, которая привязывается к некоторую элементу интерфейса, к которому возможно привязать состояние(на данный момент это пока только контейнеры, такие как panel). При это два разных элемента могут иметь одинаковое состояние на данный момент, но при этом, эти состояния будут рассматриваться независимо, то есть будут порождать независимые друг от друга цепочки действий. Если же просто, то состояние, это просто внутреннее поле-строка у элемента, на которую может реагировать некоторый объект действий.

* `action_object`(Объект действий).
Объект, объединяющий в себе сущности:

* * catch(реагирование на состояния)
* * chain(цепочки действий)
* * code(js код)
* * throw(порождение состояний)

`action_object` всегда работает в контексте того элемента ui, который породил состояние, которое и привело к работе объекта. Поэтому все действия, которые совершаются в рамках `action_object` модифицируют контекст именно этого элемента. И порождаемые события также привязаны к этому элементу. Исключением тут является js-код, который может порождать любые `action_object`, которые в свою очередь могут реагировать и на другие элементы ui. Но что касается js, то этот вопрос ещё прорабатывается, вполне возможно, что модификация контекста текущего элемента ui и модификация глобального контекста - будут рассматриваться независимо. 

Итак, простейший action_object такой:

```javascript
{
    "catch" : "first_state",
    "throw" : "second_state",
    "chain" : [
        {
            'duration' : '10sec',
            'actions' : [
                {"move_x" : "+10"},
                {"move_y" : "+10"}
            ]
        },
        {
            'duration' : '20sec',
            'actions' :[
                {"resize" : "+10%"},
                {"rotate" : "+20"}
            ]
        }
    ]
}
```

Хотя он может быть не совсем простой, но достаточно, чтобы понять как работает и увидеть нечто полезное.
Итак, мы видим следующее. Объект отрабатывает, когда появляется `first_state`. Не будем пока отвлекаться на то, как создаётся `first_state`(но возможен например такой вариант - он создаётся кодом сигнала нажатия на кнопку). Главное, что этот объект отрабатывается _только тогда, когда появляется состояние `first_state`_. Далее, это состояние убирается от элемента(да, это важный нюанс, любое состояние отменяется всякий раз, когда тот или иной объект действий поймал это состояние. Если нужно, чтобы состояние сохранялось, то оно должно быть добавлено выбрасываемые объектом действий состояния, в поле throw.

Далее, объект действий выбрасывает состояние `second_state`. Важно знать, что этот выброс произойдёт только тогда, когда _все цепочки действий и код, встроенный в объект действий будут завершены_. Считается, что именно отработка разных действий и меняют состояние. Отсюда и понятие состояние.

Далее идут цепочка действий, состоящая из действий, объединённые в объекты-группы. Каждая группа - это объект из строки `duration`(длительность в секундах или минутах) и массива действий - `actions`. В массиве содержатся действия, которые совершаются _одновременно_, потому что группы действий - это действия, которые происходят _одновременно_, в течении того времени, что указано в `duration`. В примере выше же мы видим, как элемент сначала перемещается на 10 пикселей по y и x, это делается медленно, в течении 10 секунд. Затем элемент увеличивается на 20% и поворачивается на 20 градусов по часовой стрелки, это длится 20 секунд.
Каждое действие имеет только один параметр, действие можно рассматривать как функцию, но правильнее её рассматривать как свойство(property) в понятии ООП, так как это может быть как некоторый сложный код, так и просто применение стилей, простая установка какого-то значения. 

Разумеется, каждое действие имеет своё деление на шаги по времени, а некоторые и вообще могут совершаться только мгновенно. Поэтому при просчёте времени, компилятор `action_lang` лишь выбирает оптимальный шаг действия во времени, а не приказывает.

Теперь вернёмся к тому, как появляются состояния, как они отлавливаются разными элементами и как у этих элементов порождается множество `action_object`.
Допустим у нас есть два элемента-изображения. Допустим, одно находится вверху-влево, а другое вверху-вправо. Допустим, что мы хотим их плавно опустить вниз, но прим этом, чтобы когда они опустились, они заняли всё пространство внизу, то есть увеличились по шире - каждое до 50% ширины канвы. Для того, чтобы заработали какие-то `action_object`, которые сделают описанное выше, нужно сгенерировать состояние для каждого изображения. Допустим это будут состояния `down_start1` и `down_start2` для первого и второго изображения соответственно. Сделать это либо из сигнала(наш случай), либо из какого-то другого кода(а поскольку данный черновик ещё долёк до js, то это не наш случай:D).

Итак, у каждого изображения есть сигнал - `on_show`. Который испускается, когда элемент отображается. Нам нужно привязать к нему обработчик, делается это на псевдокоде примерно так:
```javascript

image1.signal_connect('on_show', 'ui.code' : 'this.create_state(down_start1)');
image2.signal_connect('on_show', 'ui.code' : 'this.create_state(down_start2)');

```

Как видим, ничего сложного. У объектов изображений вызываются стандартные методы `signal_connect`, но в качестве обработчика указывается не функция, а строка с кодом, которая должна исполняться на стороне клиента. В данном случае это вызов метода `create_state` у каждого изображения. this в данном случае используется как указание на текущий объект изображения, то есть код _уже_ исполняется в контексте конкретного элемента, к которому присоединяется сигнал.

Итог: у нас есть два порождённых состояния - `down_start1` и `down_start2`. Как только они порождены, любые action_object, отлавливающие эти состояния могут _немедленно_ начать свою работу.

## Глобальность, локальность, namespace или относительность путей к `action_object`'ам и то, как всё это связано со `state`.

Итак, у нас есть `action_object`, содержащий некоторую логику на `action_lang`. И у нас есть некоторое состояние. 
Состояние - это поле в массиве states у элемента ui. Поэтому состояние в принципе уникально, так как идентифицируется связкой элемент ui + название состояния. Однако на это состояние может реагировать _любой_ `action_object`, который отлавливает состояние с этим именем, так как реакция происходит только на _имя_ состояния, без имени элемента. 
Реагирующие на состояние `action_object`ы ищутся в нисходящем порядке и один объект из двух объектов с одинаковым именем, находящийся выше другого в иерархии дерева подменяет другом в реакции на состояние. Механизм аналогично перекрытию локальными переменными глобальных.
