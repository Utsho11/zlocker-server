import { Router } from "express";
import { UserRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { TextRoutes } from "../modules/text/text.routes";

const router = Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/text",
    route: TextRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
