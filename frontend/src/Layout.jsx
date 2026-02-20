import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import { Outlet } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

function Layout() {
  return (
    <UserProvider>
       <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
    </UserProvider>
  );
}

export default Layout;
