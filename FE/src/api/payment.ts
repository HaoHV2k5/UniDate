import api from "./api";

export interface CreatePaymentParams {
  userId: number;
  amount: number; // VND
  orderInfo?: string;
  orderType?: string; // e.g. recharge
  language?: string; // vn or en
  fullName?: string;
  email?: string;
  mobile?: string;
  bankcode?: string;
  address1?: string; // txt_inv_addr1
  city?: string; // txt_bill_city
  country?: string; // txt_bill_country
}

// Calls POST /api/payment/buy-premium with query params and returns the VNPAY payment URL
export async function createVnpayPayment(params: CreatePaymentParams): Promise<string> {
  const {
    userId,
    amount,
    orderInfo = "Nap tien vao vi admin",
    orderType = "recharge",
    language = "vn",
    fullName,
    email,
    mobile,
    bankcode,
    address1,
    city,
    country,
  } = params;

  // Send as x-www-form-urlencoded body to match the desired format
  const body = new URLSearchParams();
  body.append("userId", String(userId));
  body.append("vnp_OrderInfo", orderInfo);
  body.append("amount", String(amount));
  body.append("ordertype", orderType);
  body.append("language", language);
  if (bankcode) body.append("bankcode", bankcode);
  if (fullName) body.append("txt_billing_fullname", fullName);
  if (mobile) body.append("txt_billing_mobile", mobile);
  if (email) body.append("txt_billing_email", email);
  if (address1) body.append("txt_inv_addr1", address1);
  if (city) body.append("txt_bill_city", city);
  if (country) body.append("txt_bill_country", country);

  const res = await api.post("/api/payment/buy-premium", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  // Response shape: { code, message, data: { code: "00", message: "success", data: "<paymentUrl>" } }
  const paymentUrl: string | undefined = res?.data?.data?.data;
  if (!paymentUrl) throw new Error("Không nhận được link thanh toán từ máy chủ");
  return paymentUrl;
}
