import React, { createContext, useContext, useState } from 'react';

const BreadcrumbContext = createContext({
    breadcrumbs: [],
    setBreadcrumbs: () => {},
});

export const useBreadcrumb = () => useContext(BreadcrumbContext);

export const BreadcrumbProvider = ({ children }) => {
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    return (
        <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
            {children}
        </BreadcrumbContext.Provider>
    );
};
