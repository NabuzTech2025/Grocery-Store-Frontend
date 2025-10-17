import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { AuthProvider } from "./auth/AuthProvider";
import { CartProvider } from "@/contexts/CartContext";

import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Lazy-loaded Admin Imports
const AdminLogin = lazy(() => import("./pages/admin/auth/AdminLogin"));
const AdminLayout = lazy(() => import("./layouts/Admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/DashboardPage"));
const Category = lazy(() => import("./pages/admin/CategoryPage"));
const CategoryList = lazy(() => import("./pages/admin/CategoryListPage"));
const Products = lazy(() => import("./pages/admin/ProductPage"));
const ProductsList = lazy(() => import("./pages/admin/ProductListPage"));
const TaxListPage = lazy(() => import("./pages/admin/TaxListPage"));
const StoreHoursListPage = lazy(() =>
  import("./pages/admin/StoreHoursListPage")
);
const DisscountPage = lazy(() => import("./pages/admin/DisscountPage"));
const ToppingListPage = lazy(() => import("./pages/admin/ToppingsListPage"));
const ToppingGroupsListPage = lazy(() =>
  import("./pages/admin/ToppingGroupsListPage")
);
const GroupsItemListPage = lazy(() =>
  import("./pages/admin/GroupsItemListPage")
);
const ProductGroupsPage = lazy(() => import("./pages/admin/ProductGroupsPage"));
const AllergyPage = lazy(() => import("./pages/admin/AllergyPage"));
// Add new allergy pages
// const AllergyGroupPage = lazy(() => import("./pages/admin/AllergyGroupPage"));
const ItemAllergyPage = lazy(() => import("./pages/admin/ItemAllergyPage"));
const CategoriesPage = lazy(() => import("./pages/admin/CategoriesPage"));

// Lazy-loaded User Imports
const UserRoute = lazy(() => import("./routes/UserRoute"));
const AdminRoute = lazy(() => import("./routes/AdminRoute"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const Home = lazy(() => import("./pages/User/Home"));
const Restaurant = lazy(() => import("./pages/User/Restaurant"));
const CheckoutPage = lazy(() => import("./pages/User/CheckoutPage"));
const UserAddress = lazy(() => import("./pages/User/UserAddress"));
const ForgotPassword = lazy(() => import("./pages/User/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/User/ResetPassword"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const PrivacypolicyPage = lazy(() => import("./pages/PrivacypolicyPage"));

// Common imports (keep normal imports since they are always needed)
import TitleUpdater from "./components/User/TitleUpdater";
import { ViewportProvider } from "./contexts/ViewportContext";
import { CommonContextProvider } from "./contexts/CommonContext";
import DisableZoom from "./components/DisableZoom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Suspense_Loader from "../ui/Suspense_Loader";
import GuestAddressPage from "./pages/GuestAddressPage";
import { StoreStatusProvider } from "./contexts/StoreStatusContext";
import { currentCurrency } from "./utils/helper/currency_type";
import { PAYPAL_CLIENT_ID } from "./utils/common_urls";
import CheckoutProtection from "./components/Protection/CheckoutProtection";
import { LanguageProvider } from "./contexts/LanguageContext";

const initialOptions = {
  "client-id": PAYPAL_CLIENT_ID,
  currency: currentCurrency.currency,
  intent: "capture",
  disableFunding: "card",
};

const APP_BASE_ROUTE = import.meta.env.VITE_APP_BASE_ROUTE || "";

function App() {
  return (
    // <React.StrictMode>
    <LanguageProvider>
      <CommonContextProvider>
        <PayPalScriptProvider options={initialOptions}>
          <ViewportProvider>
            <Provider store={store}>
              <AuthProvider>
                <StoreStatusProvider>
                  <CartProvider>
                    <BrowserRouter basename={`/${APP_BASE_ROUTE}`}>
                      <TitleUpdater />
                      <DisableZoom />
                      <Suspense fallback={<Suspense_Loader />}>
                        <Routes>
                          {/* Auth Routes */}
                          <Route path="/admin" element={<AdminLogin />} />
                          <Route
                            path="/login/:nextpage?"
                            element={<LoginPage />}
                          />
                          <Route path="/register" element={<RegisterPage />} />
                          <Route
                            path="/guest-login"
                            element={<GuestAddressPage />}
                          />
                          <Route
                            path="/forgot-password"
                            element={<ForgotPassword />}
                          />
                          <Route
                            path="/reset-password"
                            element={<ResetPassword />}
                          />

                          <Route path="/support" element={<SupportPage />} />
                          <Route
                            path="/privacypolicy"
                            element={<PrivacypolicyPage />}
                          />

                          {/* Front end routes */}
                          <Route path="/" element={<Restaurant />} />

                          {/* User-protected routes */}
                          <Route element={<UserRoute />}>
                            <Route
                              path="/checkout"
                              element={
                                <CheckoutProtection>
                                  <CheckoutPage />
                                </CheckoutProtection>
                              }
                            />
                            <Route
                              path="/update-address"
                              element={<UserAddress />}
                            />
                          </Route>

                          {/* Admin-protected routes */}
                          <Route element={<AdminRoute />}>
                            <Route path="/admin" element={<AdminLayout />}>
                              <Route path="home" element={<Dashboard />} />
                              <Route path="category" element={<Category />} />
                              <Route
                                path="category-list"
                                element={<CategoryList />}
                              />
                              <Route path="products" element={<Products />} />
                              <Route
                                path="products-list"
                                element={<ProductsList />}
                              />
                              <Route path="tax" element={<TaxListPage />} />
                              <Route
                                path="store-setting"
                                element={<StoreHoursListPage />}
                              />
                              <Route
                                path="disscount"
                                element={<DisscountPage />}
                              />
                              <Route
                                path="toppings"
                                element={<ToppingListPage />}
                              />
                              <Route
                                path="topping-groups"
                                element={<ToppingGroupsListPage />}
                              />
                              <Route
                                path="group-item"
                                element={<GroupsItemListPage />}
                              />
                              <Route
                                path="product-groups"
                                element={<ProductGroupsPage />}
                              />
                              <Route path="allergy" element={<AllergyPage />} />
                              {/* <Route
                              path="allergy-group"
                              element={<AllergyGroupPage />}
                            /> */}
                              <Route
                                path="item-allergy"
                                element={<ItemAllergyPage />}
                              />
                              {/* FIXED: CategoriesPage को AdminLayout के अंदर move किया */}
                              <Route
                                path="categories-page"
                                element={<CategoriesPage />}
                              />
                            </Route>
                          </Route>
                        </Routes>
                      </Suspense>
                    </BrowserRouter>
                  </CartProvider>
                </StoreStatusProvider>
              </AuthProvider>
            </Provider>
          </ViewportProvider>
        </PayPalScriptProvider>
      </CommonContextProvider>
    </LanguageProvider>

    // </React.StrictMode>
  );
}

export default App;
