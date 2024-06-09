import { Model } from './base/Model';
import { IProductItem, IOrder, IOrderForm, IContactsForm, FormErrors, IAppState } from '../types';

export type CatalogChangeEvent = {
	catalog: IProductItem[];
};

export class AppState extends Model<IAppState> {
	catalog: IProductItem[];
    basket: IProductItem[] = [];
	preview: string | null;
	order: IOrder = {
		address: '',
		payment: '',
		phone: '',
		email: '',
		total: 0,
		items: [],
	};	
	formErrors: FormErrors = {};

	//установить каталог товаров
	setCatalog(items: IProductItem[]) {
		this.catalog = items;
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	// добавить в корзину
	addItemToBasket(item: IProductItem) {
		this.basket.indexOf(item) < 0 ? this.basket.push(item) : false;
		this.emitChanges('basket:changed', this.basket);
		this.emitChanges('count:changed', this.basket);
	}

	// удалить из корзины
	deleteItemFromBasket(item: IProductItem) {
		const index = this.basket.indexOf(item);
		this.basket.splice(index, 1);
		this.emitChanges('basket:changed', this.basket);
		this.emitChanges('count:changed', this.basket);
	}

	// посчитать общую стоимость товаров
	getTotal() {
		return this.basket.reduce((acc, item: IProductItem) => {
			return acc + item.price;
		}, 0);
	}

	// очистить корзину после отправки заказа на сервер
	clearBasket() {
		this.basket = [];
		this.emitChanges('basket:changed', this.basket);
		this.emitChanges('count:changed', this.basket);
	}

	// предварительный просмотр товара
	setPreview(item: IProductItem) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}
	// заполняем форму - способ оплаты и адрес доставки
	setOrderForm(field: keyof IOrderForm, value: string) {
		this.order[field] = value;
	}

	// валидация формы - способ оплаты и адрес доставки
	validateOrderForm() {
		const errors: typeof this.formErrors = {};
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		if (!this.order.payment) {
			errors.payment = 'Необходимо выбрать способ оплаты';
		}
		this.formErrors = errors;
		this.events.emit('formErrors:changed', this.formErrors);
		this.events.emit('orderForm:changed', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	// заполняем форму - почта и телефон
	setContactsForm(field: keyof IContactsForm, value: string) {
		this.order[field] = value;
		if (this.validateContactsForm()) {
			this.events.emit('contactsForm:changed', this.formErrors);
		}
	}

	// валидация формы - почта и телефон
	validateContactsForm() {
		const errors: typeof this.formErrors = {};
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		if (!this.order.email) {
			errors.email = 'Необходимо указать почту';
		}
		this.formErrors = errors;
		this.events.emit('formErrors:changed', this.formErrors);
		this.events.emit('contactsForm:changed', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	// очистить заказ после успешного ответа сервера
	resetFormData() {
		this.order.payment = '';
		this.order.address = '';
		this.order.email = '';
		this.order.phone = '';
	}
}
