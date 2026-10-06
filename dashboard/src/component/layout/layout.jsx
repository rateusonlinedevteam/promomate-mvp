import React from "react";
import Manu from "../menu/manu";
import Header from "../header/header";
import { Tracker } from "../script/tracker";

const Layout = ({ site, selectsite, children }) => {
  return (
    <div className="app">
      <Manu></Manu>
      <main>
        <Header selectsite={selectsite} site={site} />
        {children}
        <Tracker selected={site} />
      </main>
    </div>
  );
};

export default Layout;
