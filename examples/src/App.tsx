import { lazy, Suspense } from "react";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Layout } from "./Layout";
import { Index } from "./pages/index/Index";
import { ProgressBox } from "./ui/ProgressBox";

const Terminal = lazy(() => import("./pages/Terminal"));

const TerminalLazy = () => {
  return (
    <Suspense fallback={<ProgressBox />}>
      <Terminal />
    </Suspense>
  );
};

export const App = () => {
  return (
    <Router hook={useHashLocation}>
      <Layout>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/terminal" component={TerminalLazy} />
          <Route>404: No such page!</Route>
        </Switch>
      </Layout>
    </Router>
  );
};
