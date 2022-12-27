let token = JSON.parse(localStorage.getItem("token.users")) ?? [];
console.log(token)

const inputEmail = document.querySelector("#inputEmail");
const inputPassword = document.querySelector("#inputPassword");
const buttonLogin = document.querySelector("#buttonLogin");
const buttonSignup = document.querySelector("#buttonSignup");


buttonLogin.onclick = function(){
    const textEmail = inputEmail.value
    const textPassword = inputPassword.value
    const user = {
        "email": textEmail,
        "password": textPassword
    }
    Login(user);
}

buttonSignup.onclick = function(){
    window.location.href="register.html"
}

async function Login(user){
    try {
        const response = await fetch(
            "https://servicepaymentapi-production.up.railway.app/api/payment/login/",
            {
                method: "POST",
                headers: {
                    "Content-type":"application/json",
                },
                body: JSON.stringify(user),
            })
            const data = await response.json();

            if (token !== []){
                token = [];
                localStorage.removeItem("token.users")
            }
            token.push(data.tokens);
            token.push({email:data.email});
            
            if (token.length === 0 || data.message === "Correo inválido o contraseña incorrecta"){
                Swal.fire({
                    icon:"error",
                    title: 'Oops...',
                    text: "Correo inválido o contraseña incorrecta!"
                })
                // window.location.href="login.html"
            }else{
                window.location.href="index.html"
            }
            localStorage.setItem("token.users",JSON.stringify(token));
        } catch (error) {
            console.log(error)
        }
}

