# Проектная работа "Веб-ларек"
Ссылка на репозиторий https://github.com/TatianaKipen/web-larek-frontend.git

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

Интерфейс, описывающий состояние приложения:
```
export interface IAppState {
	gallery: IProductItem[] - каталог товаров (массив объектов IProductItem);
	basket: string[] - корзина (массив строк, содержащих идентификаторы товаров, добавленных в корзину);
	preview: string | null - идентификатор товара для предпросмотра (значение null, если ничего не выбрано для предпросмотра);
	order: IOrder | null - информация о заказе (значение null, если заказ не оформлен);
}
```

Интерфейс, описывающий карточку товара:
```
export interface IProductItem {
	id: string - идентификатор товара;
	description: string - описание товара;
	image: string - изображение товара;
	title: string - название товара;
	category: string - категория товара;
	price: number | null - цена товара (если бесценный товар, то значение null);
}
```

Тип, описывающий способ оплаты:
```
export type PaymentMethods = 'card' | 'cash';
```

Интерфейс, описывающий форму заказа (способ оплаты и адрес доставки):
```
export interface IOrderForm {
	payment: PaymentMethods - способ оплаты;
	address: string - адрес доставки;
}
```

Интерфейс, описывающий форму ввода контактных данных:
```
export interface IContactsForm {
	email: string - электронная почта;
	phone: string - номер телефона;
}
```

Интерфейс, описывающий информацию о заказе (интерфейс объединяет свойства двух других интерфейсов и содержит дополнительные поля):
```
export interface IOrder extends IOrderForm, IContactsForm {
	items: string[] - массив строк (идентификаторы заказанных товаров);
	total: number - общая стоимость заказа;
}
```

Интерфейс, описывающий успешный заказ:
```
export interface IOrderResult {
	id: string - идентификатор заказа;
	total: number - общая стоимость заказа.
}
```

Тип для представления ошибок формы (объект, где ключи соответствуют полям заказа, а значения - ошибки):
```
export type FormErrors = Partial<Record<keyof IOrder, string>>;
```

## Архитектура приложения
1. Слой представления (отображение данных на странице);
2. Слой данных (хранение и изменение данных, логика приложения без интерфейса);
3. Presenter (связывает данные и представление; брокер событий).

### Базовый код
Включает в себя классы Api, EventEmitter, Component, Model

#### Класс API
Базовый класс, который отвечает за работу с сервером.
##### Свойства:
- readonly baseUrl: string - URL основного API;
- protected options: RequestInit - дополнительные параметры HTTP-запросов;
##### Конструктор:
constructor(baseUrl: string, options: RequestInit = {}) - принимает URL основного API, дополнительные параметры HTTP-запросов;
##### Методы:
- protected handleResponse(response: Response): Promise<object> - защищеный метод. Обрабатывает ответ сервера и возвращает ответ в виде JSON или содержимое ошибки;
- get(uri: string) - используется для получения данных с сервера (отправляет запрос и возвращает объект ответа, ответ записывается в промис);
- post(uri: string, data: object, method: ApiPostMethods = 'POST') -  используется для отправки данных на сервер.

#### Класс EventEmitter
Брокер событий, используется для обработки событий в presenter и для генерации событий.
##### Свойства:
- _events: Map - хранит карту событий и их подписчиков;
##### Конструктор:
- constructor() - создает карту событий _events;
##### Методы:
- on() - устанавливает обработчик на событие;
- off() - снимает обработчик с события;
- emit() - инициирует событие с данными;
- onAll() - устанавливает обработчик на все события;
- offAll() - снимает все обработчики событий;
- trigger() - создает коллбек-триггер, который инициирует событие при вызове.

#### Класс Component
Абстрактный класс, базовый для дочерних компонентов.
##### Конструктор:
- constructor(container: HTMLElement) - принимает контейнер, корневой DOM-элемент, в который добавляется компонент.
##### Методы:
- toggleClass(element: HTMLElement, className: string, force: boolean) - переключает класс элемента (отображение модальных окон);
- protected setText(element: HTMLElement, value: unknown) - устанавливает текстовое содержимое;
- setDisabled(element: HTMLElement, state: boolean) - устанавливает статус блокировки (кнопки при валидации);
- protected setImage(element: HTMLImageElement, src: string, alt: string) - устанавливает изображение с альтернативным текстом;
- render(data?: Partial<T>): HTMLElement - отображение компонента (принимает данные и возвращает корневой DOM-элемент).

#### Класс Model
Абстрактный класс, базовый для всех моделей данных.
##### Конструктор:
- constructor(data: Partial<T>, protected events: IEvents) - принимает данные модели и объект событий, копирует данные в модель.
##### Методы:
- emitChanges(event: string, payload?: object) - сообщает о том, что модель изменилась.


### Слой данных

#### Класс AppState
Расширяет класс Model. Отвечает за управление состоянием приложения, выполнение операций и хранение данных.
##### Свойства:
- gallery: ProductItem[] - данные о товаре;
- basket: ProductItem[] = [] - данные о товаре в корзине;
- loading: boolean;
- order: IOrder = {} - данные о заказе;
- preview: string | null - идентификационный номер товара;
- formErrors: FormErrors = {} - ошибки полей формы.
##### Конструктор:
- constructor() - наследуется от класса Model.
##### Методы:
- getTotal() - считает общую стоимость товаров в корзине;
- setGallery() - устанавливает каталог товаров;
- setPreview() - устанавливает предпросмотр товара;
- setOrderField() - устанавливает значение полей в форме оплаты;
- setContactsField() - устанавливает значение полей в форме ввода контактных данных;
- validateOrder() - проверяет правильность заполнения данных в форме оплаты;
- validateContacts() - проверяет правильность заполнения данных в форме ввода контактных данных;
- addToBasket() - добавляет выбранный товар в корзину.

### Классы представления
Отвечают за отображение данных внутри контейнера (DOM-элемента).

#### Класс Modal
Расширяет класс Component, используется для реализации модального окна. 
##### Свойства:
- protected _closeButton: HTMLButtonElement - кнопка закрытия модального окна;
- protected _content: HTMLElement - контент модального окна;
##### Конструктор:
- constructor(container: HTMLElement, events: IEvents) - принимает контейнер модального окна и объект событий.
##### Методы:
- set content(value: HTMLElement) - устанавливает контент для модального окна;
- open() - открыть модальное окно;
- close() - закрыть модальное окно;
- render(data: IModalData): HTMLElement - рендерит модальное окно с переданным контентом;

#### Класс Form
Расширяет класс Component, используется для реализации модального окна с формой ввода данных покупателя.
##### Свойства:
- protected _submit: HTMLButtonElement - кнопка отправки формы;
- protected _errors: HTMLElement - показывает ошибки;
##### Конструктор:
- constructor(protected container: HTMLFormElement, protected events: IEvents) - принимает контейнер с элементами формы, объект событий;
##### Методы:
- protected onInputChange(field: keyof T, value: string) - вызывается при изменении значения поля ввода, отправляет событие с новым значением;
- set valid(value: boolean) - устанавливает валидность формы (если форма заполнена некорректно, кнопка отправки формы неактивна);
- set errors(value: string) - устанавливает текст ошибок ввода в элемент _errors;
- render(state: Partial<T> & IFormState) - рендерит форму с переданными данными и валидностью;

#### Класс Basket
Расширяет класс Component, используется для реализации корзины товаров.
##### Свойства:
- protected _list: HTMLElement - список товаров в корзине;
- protected _total: HTMLElement - общая стоимость товаров в корзине;
- protected _button: HTMLElement - кнопка (Оформить заказ);
##### Конструктор:
- constructor(container: HTMLElement, protected events: EventEmitter) - принимает контейнер корзины и объект событий;
##### Методы:
- set items(items: HTMLElement[]) - устанавливает список товаров в корзине. Если список пуст, показывает сообщение "Корзина пуста";
- set selected(items: ProductItem[]) - выбирает товары. Если товары выбраны, кнопка заказа становится активной, иначе - неактивна;
- set total(total: string) - устанавливает общую стоимость товаров в корзине;

#### Класс Success
Расширяет класс Component, используется для реализации модального окна успешного заказа.
##### Свойства:
- protected _close: HTMLElement - кнопка закрытия сообщения об успешном заказе;
- protected _count: HTMLElement - информация о количестве синапсов, списанных при успешном заказе;
##### Конструктор:
- constructor(container: HTMLElement, actions: ISuccessActions, count: number) - принимает элемент успешной оплаты, количество синапсов, устанавливает обработчик события для кнопки закрытия;

#### Класс Order
Расширяет класс Form, используется для реализации модального окна заказа.
##### Свойства:
- protected _buttons: HTMLButtonElement[];
##### Конструктор:
-  constructor(container: HTMLFormElement, events: IEvents) - принимает элементы способа оплаты, формы доставки и данных покупателя, объект событий;
##### Методы:
- set address(value: string) - адрес покупателя;
- set email(value: string) - электронная почта покупателя;
- set phone(value: string) - номер телефона покупателя;

#### Класс Page
Расширяет класс Component, используется для управления содержимым страницы, для отображения списка товаров и корзины.
##### Свойства:
- protected _counter: HTMLElement - счетчик товаров в корзине;
- protected _gallery: HTMLElement - каталог товаров;
- protected _wrapper: HTMLElement - обертка страницы;
- protected _basket: HTMLElement - кнопка корзины товаров;
##### Конструктор:
- constructor(container: HTMLElement, protected events: IEvents) - принимает корневой элемент и объект событий;
##### Методы:
- set counter(value: number) - количество товаров в корзине;
- set gallery(items: HTMLElement[]) - список товаров;
- set locked(value: boolean) - состояние блокировки страницы;

#### Класс Card
Расширяет класс Component, используется для работы с карточками товаров.
##### Свойства:
- protected _title: HTMLElement - наименование товара;
- protected _image: HTMLImageElement - изображение товара;
- protected _price: HTMLElement - цена товара;
- protected _category: HTMLElement - категория товара;
- protected _description: HTMLElement - описание товара;
- protected _button: HTMLButtonElement - кнопка карточки;
##### Конструктор:
- constructor(container: HTMLElement, actions?: ICardActions) - принимает контейнер, в который будет рендериться компонент, и дополнительные действия.
##### Методы:
- set id(value: string) - устанавливает идентификатор товара;
- set title(value: string) - устанавливает наименование товара;
- set image(value: string) - устанавливает изображение товара;
- set category(value: string) - устанавливает категорию товара;
- set inBasket(value: boolean) - определяет, находится ли карточка в корзине;
- set price(value: string) - устанавливает цену;
- set description(value: string) - устанавливает описание карточки.

### Описание событий

- modal:open - открытие модальных окон (страница блокируется);
- modal:close - закрытие модальных окон (страница разблокируется);
- basket:open - открытие корзины (отображается ее содержимое);
- order:open - открытие формы заказа с указание формы оплаты и адреса (отображается форма с пустыми полями);
- contacts:open - открытие формы ввода контактных данных (отображается форма с пустыми полями);
- basket:update - обновление содержимого корзины (отображается новое содержимое корзины);
- basket:remove - удаление товара из корзины (выбранный товар удаляется из корзины);
- basket:clear - очистка корзины (все товары удаляются из корзины);
- order:submit - отправка формы заказа с указание формы оплаты и адреса (открывается форма ввода контактных данных);
- contacts:submit - отправка формы с контактными данными (появляется сообщение об успешном оформлении заказа);
- formErrors:change - изменение ошибок валидации формы (отображается соответствующее сообщение об ошибке).