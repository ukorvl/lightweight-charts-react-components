import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Layout } from "./Layout";
import { Index } from "./pages";

export const App = () => {
  return (
    <Router hook={useHashLocation}>
      <Layout>
        <Switch>
          <Route path="/" component={Index} />
          <Route>404: No such page!</Route>
        </Switch>
      </Layout>
    </Router>
  );
};
