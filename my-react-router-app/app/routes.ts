import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),  // default home route
  route("/login", "./routes/login.tsx"),
  route("/account", "./routes/account.tsx"),
  route("/cart", "./routes/cart.tsx"),
  route("/property-details", "./routes/property-details.tsx"),
  route("/search", "./routes/search.tsx"),
] satisfies RouteConfig;
