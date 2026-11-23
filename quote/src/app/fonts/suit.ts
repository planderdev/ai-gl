import localFont from "next/font/local";

/** SUIT 가변 폰트(100~900). 고객 사이트(/sgl)와 VIP 랜딩(/sgl-vip)이 함께 쓴다. 저장소에서 직접 내려 주며 라이선스는 OFL.txt */
export const suit = localFont({ src: "./SUIT-Variable.woff2", weight: "100 900", variable: "--f-suit", display: "swap" });
