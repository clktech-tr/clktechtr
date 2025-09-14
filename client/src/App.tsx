import { Router, Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import CodingApp from "@/pages/coding-app";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Admin from "@/pages/admin";
import TestButton from "@/pages/test-button";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={Products} />
            <Route path="/products/:id" component={ProductDetail} />
            <Route path="/coding-app" component={CodingApp} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route path="/admin" component={Admin} />
            <Route path="/test-button" component={TestButton} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
