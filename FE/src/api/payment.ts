import api from "./api";

export interface CreatePaymentParams {
  userId: number;
  amount: number; // VND
  orderInfo?: string;
  orderType?: string;
  language?: string; // vn or en
  fullName?: string;
  email?: string;
  mobile?: string;
}

// Calls POST /api/payment/buy-premium with query params and returns the VNPAY payment URL
export async function createVnpayPayment(params: CreatePaymentParams): Promise<string> {
  const {
    userId,
    amount,
    orderInfo = "Nap tien vao vi admin",
    orderType = "billpayment",
    language = "vn",
    fullName,
    email,
    mobile,
  } = params;

  const queryParams: Record<string, string | number> = {
    userId,
    amount,
    vnp_OrderInfo: orderInfo,
    ordertype: orderType,
    language,
  };

  if (fullName) queryParams["txt_billing_fullname"] = fullName;
  if (email) queryParams["txt_billing_email"] = email;
  if (mobile) queryParams["txt_billing_mobile"] = mobile;

  const res = await api.post("/api/payment/buy-premium", null, { params: queryParams });
  // Response shape: { code, message, data: { code: "00", message: "success", data: "<paymentUrl>" } }
  const paymentUrl: string | undefined = res?.data?.data?.data;
  if (!paymentUrl) throw new Error("Không nhận được link thanh toán từ máy chủ");
  return paymentUrl;
}

