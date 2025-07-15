import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { TextRoutes } from "../modules/text/text.routes";
import { ImageRoutes } from "../modules/Image/image.routes";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/text",
    route: TextRoutes,
  },
  {
    path: "/image",
    route: ImageRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
