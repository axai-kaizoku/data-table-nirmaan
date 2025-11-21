import { Header } from "./components/layout/header";
import { Main } from "./table/main";

export default function App() {
  return (
    <section className="mx-auto flex flex-col">
      <Header />
      <Main />
    </section>
  );
}
