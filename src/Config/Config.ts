const BASE_URL = "https://www.visiostencils.com/stencilsforoffice/api/Library/"; 

export default BASE_URL


export const PROD_URL = {
    production:true,
    domainUrl:`${window.location.origin}`,
    apiurl: `${window.location.pathname}api`
}