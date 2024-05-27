//состояние приложения
export interface IAppState {
	gallery: IProductItem[];
	basket: string[];
	preview: string | null;
	order: IOrder | null;
}

// карточка товара
export interface IProductItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

//способ оплаты
export type PaymentMethods = 'card' | 'cash';

// форма оплаты
export interface IOrderForm {
	payment: PaymentMethods;
	address: string;
}

//форма ввода контактных данных
export interface IContactsForm {
	email: string;
	phone: string;
}

//форма заказа
export interface IOrder extends IOrderForm, IContactsForm {
	items: string[];
	total: number;
}

//успешный заказ
export interface IOrderResult {
	id: string;
	total: number;
}

//ошибки формы
export type FormErrors = Partial<Record<keyof IOrder, string>>;