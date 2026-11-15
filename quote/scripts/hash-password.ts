/**
 * LOGIN_ACCOUNTS 에 넣을 "아이디:해시" 한 줄을 만든다. 비밀번호는 표준입력으로 받는다(셸 기록에 남지 않게).
 *   npm run -s hash-password -- sglmkt            # 비밀번호 입력 후 Enter
 * 여러 계정은 콤마로 이어 붙인다: "a:pbkdf2$...,b:pbkdf2$..."
 */
import { hashPassword } from "../src/lib/auth/session";

async function main() {
  const id = (process.argv[2] ?? "").trim().toLowerCase();
  if (!id || /[:,\s]/.test(id)) throw new Error("사용법: npm run -s hash-password -- <아이디>  (아이디에 : , 공백 불가)");
  if (process.stdin.isTTY) process.stderr.write("비밀번호: ");
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  const password = input.replace(/\r?\n$/, "");
  if (!password) throw new Error("비밀번호가 비어 있습니다");
  process.stdout.write(`${id}:${await hashPassword(password)}\n`);
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
