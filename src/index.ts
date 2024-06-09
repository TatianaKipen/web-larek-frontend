import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/Eveeeeeeents';
import { Modal } from './components/common/Modal';
import { Basket } from './components/Basket';
import { Success } from './components/Success';
import { ProductAPI } from './components/ProductAPI';
import { AppState, CatalogChangeEvent } from './components/AppData';
import { Card } from './components/Card';
import { Page } from './components/Page';
import { cloneTemplate, ensureElement } from './utils/utils';
import { IProductItem, IOrderForm, IContactsForm } from './types';
import { ContactsForm } from './components/ContactsForm';
import { OrderForm } from './components/OrderForm';

const events = new EventEmitter();
const api = new ProductAPI(CDN_URL, API_URL);

const textAdd = 'В корзину';
const textDelete = 'Убрать из корзины';

const orderObject = {
	payment: '',
	address: '',
};

const contactsObject = {
	email: '',
	phone: '',
};

// Все шаблоны
const successOrderTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderFormTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsFormTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLTemplateElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);

const orderFormContainer = new OrderForm(
	cloneTemplate(orderFormTemplate),
	events,
	{
		onClick: (event: Event) => {
			events.emit('payment:changed', event.target);
		},
	}
);

const contactsFormContainer = new ContactsForm(cloneTemplate(contactsFormTemplate), events);

// Бизнес-логика 

// Наполняем каталог карточками
events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			...item,
			//title: item.title,
			//image: item.image,
			//category: item.category,
			//price: item.price,
		});
	});
});

// Подготавливаем карточку к просмотру
events.on('card:select', (item: IProductItem) => {
	appData.setPreview(item);
});

// Открываем модальное окно предпросмотра
events.on('preview:changed', (item: IProductItem) => {
	let buttonText;
	let onClick;

	if (item.price === null) {
		buttonText = 'Товар не продается';
		onClick = () => {};
	} else {
		buttonText = appData.basket.indexOf(item) < 0 ? textAdd : textDelete;
		onClick = () => {
			events.emit('item:check', item);
			card.button = appData.basket.indexOf(item) < 0 ? textAdd : textDelete;
		};
	}

	const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
		onClick: onClick,
	});

	modal.render({
		content: card.render({button: buttonText, ...item,}),
	});
});

// Проверяем, находится ли товар в корзине
events.on('item:check', (item: IProductItem) => {
	appData.basket.indexOf(item) < 0 ? events.emit('item:add', item) : events.emit('item:delete', item);
});

// Добавить товар в корзину
events.on('item:add', (item: IProductItem) => {
	appData.addItemToBasket(item);
});

// Удалить товар из корзины
events.on('item:delete', (item: IProductItem) => {
	appData.deleteItemFromBasket(item);
});

// Показать карточки товаров в корзине
events.on('basket:changed', (items: IProductItem[]) => {
	basket.items = items.map((item, index) => {
		const card = new Card('card', cloneTemplate(cardBasketTemplate), {
			onClick: () => {events.emit('item:delete', item);},
		});
		const cardElement = card.render({...item,});
		const indexElement = cardElement.querySelector('.basket__item-index');
		if (indexElement) {
			indexElement.textContent = (index + 1).toString();
		}
		return cardElement;
	});

	basket.total = appData.getTotal();
	appData.order.total = appData.getTotal();
});

// Изменение количества товаров в корзине
events.on('count:changed', () => {
	page.counter = appData.basket.length;
});

// Открыть корзину
events.on('basket:open', () => {
	modal.render({
		content: basket.render({}),
	});
});

// Открыть форму заказа - способ оплаты и адрес доставки
events.on('order:open', () => {
	modal.render({
		content: orderFormContainer.render({
			valid: false,
			errors: [],
			...orderObject,
		}),
	});
	appData.order.items = appData.basket.map((item) => item.id);
});

// Выбираем способ оплаты
events.on('payment:changed', (target: HTMLButtonElement) => {
	if (!target.classList.contains('button_alt-active')) {
		orderFormContainer.togglePaymentButton(target);
		appData.order.payment = target.getAttribute('name');
		appData.validateOrderForm();
	}
});

// Указываем адрес доставки
events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderForm(data.field, data.value);
		appData.validateOrderForm();
	}
);

// Валидация формы заказа - способ оплаты и адрес доставки
events.on('orderForm:changed', (errors: Partial<IOrderForm>) => {
	const { payment, address } = errors;
	orderFormContainer.valid = !payment && !address;
	orderFormContainer.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
});

// Отправляем данные первой формы (способ оплаты и адрес) и открываем форму с почтой и телефоном
events.on('order:submit', () => {
	orderFormContainer.clearPayment();
	modal.render({
		content: contactsFormContainer.render({
			valid: false,
			errors: [],
			...contactsObject,
		}),
	});
	appData.order.items = appData.basket.map((item) => item.id);
});

// Заполняем вторую форму с почтой и телефоном
events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IContactsForm; value: string }) => {
		appData.setContactsForm(data.field, data.value);
	}
);

// Валидация формы заказа - телефон и почта
events.on('contactsForm:changed', (errors: Partial<IContactsForm>) => {
	const { email, phone } = errors;
	contactsFormContainer.valid = !email && !phone;
	contactsFormContainer.errors = Object.values({ email, phone })
		.filter((i) => !!i)
		.join('; ');
});

events.on('contact:changed', () => {
	contactsFormContainer.valid = true;
});

// Отправляем данные на сервер
events.on('contacts:submit', () => {
	api.postOrderProduct(appData.order)
		.then((result) => {
			const success = new Success(cloneTemplate(successOrderTemplate), {
				onClick: () => {
					modal.close();
					appData.clearBasket();
				}
			});
			success.total = result.total.toString();
			modal.render({ content: success.render({}) });
			appData.resetFormData();
			appData.clearBasket();
		})
		.catch((err) => {
			console.error(err)
		});
});

// Блокируем прокрутку страницы, если открыто модальное окно
events.on('modal:open', () => {
	page.locked = true;
});

// ...разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

// Получаем данные с сервера
api
	.getProductList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});
