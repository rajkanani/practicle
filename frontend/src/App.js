import { Provider } from "react-redux";
import Router from "./Router";
import store from "./store/store";


function App(props) {
  return (
    <Provider store={store}>
      <Router />
    </Provider>
  );
}

export default App;
