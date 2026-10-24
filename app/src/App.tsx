import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./design-system";
import { AuthProvider } from "./auth/AuthContext";
import { AppLayout } from "./layout/AppLayout";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { PublicOnlyRoute } from "./features/auth/PublicOnlyRoute";
import { RequireAuth } from "./features/auth/RequireAuth";
import { MapPage } from "./features/map/MapPage";
import { RewardsPage } from "./features/rewards/RewardsPage";
import { RankingPage } from "./features/ranking/RankingPage";
import { ProfilePage } from "./features/profile/ProfilePage";
import { InstallAppPage } from "./features/pwa/InstallAppPage";
import { OfflineGate } from "./features/pwa/OfflineGate";

function App() {
    return (
        <ToastProvider>
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

                            {/* El mapa es la pantalla principal y va a pantalla completa:
                                no comparte el contenedor con el resto. */}
                            <Route element={<RequireAuth />}>
                                <Route index element={<MapPage />} />

                                <Route element={<AppLayout />}>
                                    <Route path="canjes" element={<RewardsPage />} />
                                    <Route path="ranking" element={<RankingPage />} />
                                    <Route path="perfil" element={<ProfilePage />} />
                                    <Route path="instalar" element={<InstallAppPage />} />
                                </Route>
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </OfflineGate>
                </BrowserRouter>
            </AuthProvider>
        </ToastProvider>
    );
}

export default App;
