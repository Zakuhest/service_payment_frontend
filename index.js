const token = JSON.parse(localStorage.getItem("token.users")) ?? [];

const resultRow = document.querySelector("#resultRow");
const UserLogueado = document.querySelector("#UserLogueado");

const buttonLogout = document.querySelector("#buttonLogout");
const buttonInicio = document.querySelector("#buttonInicio");
const buttonNuevoPago = document.querySelector("#buttonNuevoPago");
const buttonServicios = document.querySelector("#buttonServicios");

buttonLogout.onclick= function(){
    localStorage.removeItem("token.users")
    localStorage.removeItem("id.users")
    localStorage.removeItem("is_staff.users")
    localStorage.removeItem("services")
    window.location.href="login.html"
}

async function Refresh() {
        try {
        const response = await fetch(
            "https://servicepaymentapi-production.up.railway.app/api/payment/refresh/", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({refresh:token[token.length-2].refresh})
        });

        const data = await response.json();
        token[token.length-2].access = data.access
        ListPayments()

    } catch (error) {
        console.log(error);
    }
}

async function ListPayments() {
    try {
        let response = await fetch(
            "https://servicepaymentapi-production.up.railway.app/api/v2/payment/", {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token[token.length-2].access}`,
            }
        });

        const payment = await response.json();
        if (payment.code == "token_not_valid"){
            Refresh()
        }

        response = await fetch(
            "https://servicepaymentapi-production.up.railway.app/api/payment/users/", {
                method: "GET",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token[token.length-2].access}`,
            }
        });

        const users = await response.json();
        if (users.code == "token_not_valid"){
            Refresh()
        }

        response = await fetch(
            "https://servicepaymentapi-production.up.railway.app/api/v2/service/", {
                method: "GET",
                headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token[token.length-2].access}`,
            }
        });

        const service = await response.json();
        if (service.code == "token_not_valid"){
            Refresh()
        }

        response = await fetch(
            "https://servicepaymentapi-production.up.railway.app/api/v2/expired/", {
                method: "GET",
                headers: {
                    "Content-type": "application/json",
                Authorization: `Bearer ${token[token.length-2].access}`,
            }
        });

        const expired = await response.json();
        if (expired.code ==="token_not_valid"){
            Refresh()
        }
        
        CardPayments(payment, service, expired, users)
        
    } catch (error) {
        console.log(error);
    }
}

function CardPayments(payments, service, expired, users){
    users.results.forEach((usr)=>{
        if (token[token.length-1].email === usr.email){
            UserLogueado.innerHTML = `
            <i class="bi bi-person-circle" style="color:white"></i>
            <span class="text-white">${usr.username}</span>
            `
            localStorage.setItem("id.users",usr.id);
            localStorage.setItem("is_staff.users",usr.is_staff);
        }
    })

    resultRow.innerHTML = `
        <div>
            <h2 class="text-white">Pagos realizados</h2>
        </div>
    `
    payments.results.forEach((pay) => {
        service.results.forEach((serv) =>{
            users.results.forEach((usr)=>{
                if (usr.email === token[token.length-1].email &&
                    serv.id === pay.service_id && pay.user_id === usr.id){
                    resultRow.innerHTML += `
                        <nav class="navbar navbar-expand-lg navbar-light bg-success mt-3 text-white" style="border-radius: 10px;">
                            <div class="container-fluid">
                            <img src="${serv.logo}" width="70px" height="40px" style="background-color:white; border-radius:10px;">
                            <span>${serv.name}</span>
                            <span>${pay.payment_date}</span>
                            <span>Monto: ${pay.amount}</span>
                            </div>
                            </a>
                        </nav>
                    `
                }
            })
        })
    });

    resultRow.innerHTML += `
    <div class="mt-5">
        <h2 class="text-white">Pagos vencidos</h2>
    </div>
    `

    payments.results.forEach((pay) => {
        service.results.forEach((serv) =>{
            users.results.forEach((usr)=>{
                expired.results.forEach((exp)=>{
                    if (usr.email === token[token.length-1].email &&
                        serv.id === pay.service_id &&
                        pay.user_id === usr.id && exp.pay_user_id === pay.id){
                        resultRow.innerHTML += `
                            <nav class="navbar navbar-expand-lg navbar-light bg-danger mt-3 text-white" style="border-radius: 10px;">
                                <div class="container-fluid">
                                <img src="${serv.logo}" width="70px" height="40px" style="background-color:white; border-radius:10px;">
                                <span>${serv.name}</span>
                                <span>${pay.payment_date}</span>
                                <span>Monto: ${pay.amount}</span>
                                <span>Penalidad: ${exp.penalty_fee_amount}</span>
                                </div>
                                </a>
                            </nav>
                        `
                    }
                })
            })
        })
    });
}

ListPayments();

buttonInicio.onclick = function(){
    ListPayments();
}

buttonNuevoPago.onclick = function(){
    if (JSON.parse(localStorage.getItem("services") !== 'undefined')){
        FormNewPayment(JSON.parse(localStorage.getItem("services")))
    }else{
        Refresh()
    }

}

async function getServices() {
    try {
        const response = await fetch(
            "https://servicepaymentapi-production.up.railway.app/api/v2/service/", {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token[token.length-2].access}`,
            }
        });
        const service = await response.json();
        if (service.code ==="token_not_valid"){
            Refresh()
        }
        localStorage.setItem("services", JSON.stringify(service.results))
    } catch (error) {
        console.log(error);
    }
}

getServices();

async function NewPayment(payment){
    try {
        await fetch(
            "https://servicepaymentapi-production.up.railway.app/api/v2/payment/",
            {
                method: "POST",
                headers: {
                    "Content-type":"application/json",
                    Authorization: `Bearer ${token[token.length-2].access}`,
                },
                body: JSON.stringify(payment),
            }).then((response)=>{
                if (response.ok){
                    if (response.ok){
                    Swal.fire({
                        icon: 'success',
                        title: '¡Añadido!',
                        text: 'Pago añadido correctamente'
                        }
                        ).then((result) => {
                            if (result.isConfirmed) {
                                window.location.replace("index.html");
                            }
                        })
                    }
                }
                else{
                    Swal.fire({
                        icon:"error",
                        title: 'Error',
                        text: "Datos incorrectos!"
                    })           
                }
            })
    } catch (error) {
        console.log(error)
    }
}

function FormNewPayment(service){
    resultRow.innerHTML = `
        <div>
            <h2 class="text-white text-center">Añadir Nuevo Pago</h2>
        </div>
    `;
    resultRow.innerHTML += `
        <div class="mt-4 text-center">
            <form>
                <div class="form-group">
                    <label class="text-white">Fecha de Vencimiento: </label>
                    <input type="date" class="form-control border-primary" id="inputExpired">
                </div>
                <div class="form-group">
                    <label class="text-white">Servicio: </label><br>
                    <select class="form-control" name="services" id="service">
                    </select>
                </div>
                <div class="form-group">
                    <label class="text-white">Monto: </label>
                    <input type="number" class="form-control border-primary" id="inputMonto" placeholder="0.00">
                </div>
                <div class="text-right mt-4">
                    <a class="btn btn-outline-success font-weight-bold" type="button" id="buttonAdd" style="background-color: white; color: green;">Añadir</a>
                </div>
            </form>
        </div>
    `
    const selectService = document.querySelector("#service")
    service.forEach((serv)=>{
        selectService.innerHTML += `
            <option value="${serv.id}">${serv.name}</option>
        `
    })
    const inputExpired = document.querySelector("#inputExpired");
    const inputMonto = document.querySelector("#inputMonto");
    const buttonAdd = document.querySelector("#buttonAdd");

    buttonAdd.onclick = function(){
        const valueExpired = inputExpired.value
        const valueService = parseInt(selectService.value, 10)
        const valueMonto = inputMonto.value
        const payment = {
            "amount": valueMonto,
            "expiration_date": valueExpired,
            "user_id": parseInt(localStorage.getItem("id.users"),10),
            "service_id": valueService
        }
        NewPayment(payment);
    }
}

buttonServicios.onclick = function(){
    if(localStorage.getItem("is_staff.users") !== 'true'){
        Swal.fire({
            icon:"error",
            title: '401',
            text: "Unauthorized"
        })
    }else{
        if (JSON.parse(localStorage.getItem("services") !== 'undefined')){
            Form_Add_Update_Service(JSON.parse(localStorage.getItem("services")))
        }else{
            Refresh()
        }
    }
}

async function NewService(service){
    try {
        await fetch(
            "https://servicepaymentapi-production.up.railway.app/api/v2/service/",
            {
                method: "POST",
                headers: {
                    "Content-type":"application/json",
                    Authorization: `Bearer ${token[token.length-2].access}`,
                },
                body: JSON.stringify(service),
            }).then((response)=>{
                if (response.ok){
                    if (response.ok){
                    Swal.fire({
                        icon: 'success',
                        title: '¡Añadido!',
                        text: 'Servicio añadido correctamente'
                        }
                        ).then((result) => {
                            if (result.isConfirmed) {
                                window.location.replace("index.html");
                            }
                        })
                    }
                }
                else{
                    Swal.fire({
                        icon:"error",
                        title: 'Error',
                        text: "Datos incorrectos!"
                    })           
                }
            })
    } catch (error) {
        console.log(error)
        Refresh()
    }
}

function Form_Add_Update_Service(service){
    resultRow.innerHTML = `
        <div>
            <h2 class="text-white text-center">Añadir Nuevo Servicio</h2>
        </div>
    `;
    resultRow.innerHTML += `
        <div class="mt-4 text-center">
            <form>
                <div class="form-group">
                    <label class="text-white">Nombre: </label>
                    <input type="text" class="form-control border-primary" id="inputName">
                </div>
                <div class="form-group">
                    <label class="text-white">Descripcion: </label><br>
                    <input type="text" class="form-control border-primary" id="inputDescription">
                </div>
                <div class="form-group">
                    <label class="text-white">URL Logo: </label>
                    <input type="text" class="form-control border-primary" id="inputLogo">
                </div>
                <div class="text-right mt-4">
                    <a class="btn btn-outline-success font-weight-bold" type="button" id="buttonAdd" style="background-color: white; color: green;">Añadir</a>
                </div>
            </form>
        </div>
    `
    resultRow.innerHTML += `
        <div class="mt-4">
            <h2 class="text-white text-center">Modificar Servicio</h2>
        </div>
    `;
    resultRow.innerHTML += `
        <div class="mt-4 text-center">
            <form>
                <div class="form-group">
                    <label class="text-white">Servicio: </label><br>
                    <select class="form-control" name="services" id="service">
                    </select>
                </div>
                <div class="form-group">
                    <label class="text-white">Nombre: </label>
                    <input type="text" class="form-control border-primary" id="inputNameUpdt">
                </div>
                <div class="form-group">
                    <label class="text-white">Descripcion: </label><br>
                    <input type="text" class="form-control border-primary" id="inputDescriptionUpdt">
                </div>
                <div class="form-group">
                    <label class="text-white">URL Logo: </label>
                    <input type="text" class="form-control border-primary" id="inputLogoUpdt">
                </div>
                <div class="text-right mt-4">
                    <a class="btn btn-outline-success font-weight-bold" type="button" id="buttonUpdt" style="background-color: white; color: green;">Modificar</a>
                </div>
            </form>
        </div>
    `
    const selectService = document.querySelector("#service")
    service.forEach((serv)=>{
        selectService.innerHTML += `
            <option value="${serv.id}">${serv.name}</option>
        `
    })

    const inputName = document.querySelector("#inputName");
    const inputDescription = document.querySelector("#inputDescription");
    const inputLogo = document.querySelector("#inputLogo");
    const buttonAdd = document.querySelector("#buttonAdd");

    const inputNameUpdt = document.querySelector("#inputNameUpdt");
    const inputDescriptionUpdt = document.querySelector("#inputDescriptionUpdt");
    const inputLogoUpdt = document.querySelector("#inputLogoUpdt");
    const buttonUpdt = document.querySelector("#buttonUpdt");
    

    buttonAdd.onclick = function(){
        const valueName = inputName.value
        const valueDescription = inputDescription.value
        const valueLogo = inputLogo.value
        const service = {            
            "name": valueName,
            "description": valueDescription,
            "logo": valueLogo,
        }
        NewService(service);
    }
    
    async function getServicesRetrieve(id) {
        try {
            const response = await fetch(
                `https://servicepaymentapi-production.up.railway.app/api/v2/service/${id}/`, {
                    method: "GET",
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${token[token.length-2].access}`,
                    }
                });
                const service = await response.json();
                if (service.code ==="token_not_valid"){
                Refresh()
            }
            inputNameUpdt.value = service.name
            inputDescriptionUpdt.value = service.description
            inputLogoUpdt.value = service.logo
        } catch (error) {
            console.log(error);
        }
    }
    
    selectService.onclick = function(){
        const valueService = parseInt(selectService.value, 10)
        getServicesRetrieve(valueService)
        
        buttonUpdt.onclick = function(){
            const valueName = inputNameUpdt.value
            const valueDescription = inputDescriptionUpdt.value
            const valueLogo = inputLogoUpdt.value
            const service = {            
                "name": valueName,
                "description": valueDescription,
                "logo": valueLogo,
            }
            putServices(valueService, service)
        }
    }


    async function putServices(id, serviceupdt) {
        try {
            await fetch(
                `https://servicepaymentapi-production.up.railway.app/api/v2/service/${id}/`, {
                    method: "PUT",
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${token[token.length-2].access}`,
                    },
                    body: JSON.stringify(serviceupdt)
                }).then((response)=>{
                    if (response.ok){
                        if (response.ok){
                        Swal.fire({
                            icon: 'success',
                            title: '¡Modificado!',
                            text: 'Servicio modificado correctamente'
                            }
                            ).then((result) => {
                                if (result.isConfirmed) {
                                    window.location.replace("index.html");
                                }
                            })
                        }
                    }
                    else{
                        Swal.fire({
                            icon:"error",
                            title: 'Error',
                            text: "Datos incorrectos!"
                        })           
                    }
                })
        } catch (error) {
            console.log(error);
        }
    }
}
