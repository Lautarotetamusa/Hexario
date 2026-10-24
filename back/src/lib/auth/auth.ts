import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { Unauthorized } from "bradb";
import { env } from "../../env";
import { TokenUser } from "../../modules/user/user.validator";

export const signToken = (user: TokenUser): string =>
    jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });

// `jwt.verify` tira ante un token vencido/mal firmado: hay que traducirlo a
// 401 acá, si no `handleErrors` lo vería como un error interno (500).
const verifyToken = (token: string): TokenUser => {
    try {
        const { id } = jwt.verify(token, env.JWT_SECRET) as TokenUser;
        return { id };
    } catch {
        throw new Unauthorized("Token inválido o vencido");
    }
};

const bearerToken = (header: string | undefined): string | undefined => {
    const [scheme, token] = header?.split(" ") ?? [];
    return scheme === "Bearer" ? token : undefined;
};

export const auth: RequestHandler = (req, res, next) => {
    const token = bearerToken(req.headers.authorization);
    if (!token) throw new Unauthorized("Falta el token de autenticación");

    res.locals.user = verifyToken(token);
    next();
};
