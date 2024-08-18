import { CartProvider } from "../cart-provider"
import MenuShop from "./menu/menu-shop"
import NavbarShop from "./navbar-shop/navbar-shop"

const Shop = () => {
  return (
    <CartProvider>
      <NavbarShop />
      <MenuShop />
    </CartProvider>
  )
}

export default Shop
