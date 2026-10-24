import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ToastProvider } from "./notifications/ToastProvider";
import { ConfirmProvider } from "./notifications/ConfirmProvider";
import { AppLayout } from "./layout/AppLayout";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { PublicOnlyRoute } from "./features/auth/PublicOnlyRoute";
import { RequireAuth } from "./features/auth/RequireAuth";
import { HomePage } from "./features/home/HomePage";
import { ProfilePage } from "./features/profile/ProfilePage";
import { InstallAppPage } from "./features/pwa/InstallAppPage";
import { OfflineGate } from "./features/pwa/OfflineGate";

function App() {
    return (
        <ToastProvider>
            <ConfirmProvider>
                <AuthProvider>
                    <BrowserRouter>
                        {/* Sin conexión se reemplaza la app entera por la pantalla de
                            aviso: cubre cualquier ruta sin repetir la comprobación. */}
                        <OfflineGate>
                            <Routes>
                                {/* Pantallas de sesión: sólo sin sesión abierta. */}
                                <Route element={<PublicOnlyRoute />}>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/registro" element={<RegisterPage />} />
                                </Route>

                                {/* Todo lo demás pide sesión y vive dentro del layout con navegación. */}
                                <Route element={<RequireAuth />}>
                                    <Route element={<AppLayout />}>
                                        <Route index element={<HomePage />} />
                                        <Route path="perfil" element={<ProfilePage />} />
                                        <Route path="instalar" element={<InstallAppPage />} />
                                    </Route>
                                </Route>

                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </OfflineGate>
                    </BrowserRouter>
                </AuthProvider>
            </ConfirmProvider>
        </ToastProvider>
    );
}

export default App;
