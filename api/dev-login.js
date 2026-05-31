/**
 * POST /api/dev-login — тестовый вход с полным доступом (роль admin).
 *
 * БЕЗОПАСНОСТЬ: работает ТОЛЬКО когда задана переменная окружения TEST_LOGIN=1.
 * По умолчанию (в проде) возвращает 404 и не существует для клиента.
 * НИКОГДА не включайте TEST_LOGIN на публичном проде — это обходит оплату и
 * выдаёт права администратора.
 *
 * Выдаёт stateless-сессию синтетического пользователя test-admin. Полный доступ
 * к книгам этому пользователю выдаёт lib/entitlements.js (тоже под гейтом TEST_LOGIN).
 */
import { createSession } from '../lib/auth.js';

export const TEST_ADMIN_ID = 'test-admin';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // Гейт: без TEST_LOGIN=1 эндпоинта как будто нет
  if (process.env.TEST_LOGIN !== '1') {
    return res.status(404).json({ error: 'Not found' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = {
    id: TEST_ADMIN_ID,
    first_name: 'Тест',
    username: 'test_full_access',
    role: 'admin',
  };
  const token = createSession(user);

  return res.status(200).json({
    token,
    user: {
      tgId: TEST_ADMIN_ID,
      name: 'Тест (полный доступ)',
      username: 'test_full_access',
      role: 'admin',
      photo: '',
    },
  });
}
