import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { signToken } from "../services/tokenService.js";

const publicUserFields = "id, full_name, document, email, phone, profession, council, profile_type, role, created_at";

export async function register(req, res) {
  const { fullName, document, email, phone, profession, council, password, profileType } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const { rows } = await query(
      `insert into users (full_name, document, email, phone, profession, council, password_hash, profile_type)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning ${publicUserFields}`,
      [fullName, document, email.toLowerCase(), phone, profession, council, passwordHash, profileType]
    );

    const user = rows[0];
    return res.status(201).json({ user, token: signToken(user) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "E-mail ou CPF/CNPJ já cadastrado." });
    }

    return res.status(500).json({ message: "Não foi possível criar o cadastro." });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const { rows } = await query("select * from users where email = $1", [email.toLowerCase()]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: "E-mail ou senha inválidos." });
  }

  const publicUser = {
    id: user.id,
    full_name: user.full_name,
    document: user.document,
    email: user.email,
    phone: user.phone,
    profession: user.profession,
    council: user.council,
    profile_type: user.profile_type,
    role: user.role,
    created_at: user.created_at
  };

  return res.json({ user: publicUser, token: signToken(user) });
}

export async function me(req, res) {
  const { rows } = await query(`select ${publicUserFields} from users where id = $1`, [req.user.sub]);

  if (!rows[0]) {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }

  return res.json({ user: rows[0] });
}
