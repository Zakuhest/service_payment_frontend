const inputEmail = document.querySelector("#inputEmail");
const inputPassword = document.querySelector("#inputPassword");
const inputUsername = document.querySelector("#inputUsername");
const buttonBack = document.querySelector("#buttonBack")
const buttonRegister = document.querySelector("#buttonRegister")

buttonBack.onclick = function(){
    window.location.href = "login.html"
}

buttonRegister.onclick = function(){
    const textEmail = inputEmail.value
    const textUsername = inputUsername.value
    const textPassword = inputPassword.value
    const newUser = {
        "email": textEmail,
        "username": textUsername,
        "password": textPassword
    }
    Signup(newUser)
}

async function Signup(newUser){
    try {
        await fetch(
            "https://servicepaymentapi-production.up.railway.app/api/payment/signup/",
            {
                method: "POST",
                headers: {
                    "Content-type":"application/json",
                },
                body: JSON.stringify(newUser),
            }).then((response)=>{
                if (response.ok){
                    if (response.ok){
                    Swal.fire({
                        icon: 'success',
                        title: '¡Creado!',
                        text: 'Registrado correctamente'
                        }
                        ).then((result) => {
                        if (result.isConfirmed) {
                            window.location.replace("login.html");
                        }
                    })
                    } 
                }
                else{
                    Swal.fire({
                        icon:"error",
                        title: 'Oops...',
                        text: "Email ya esta registrado o datos incorrectos!"
                    })           
                }
            })
        } catch (error) {
            console.log(error)
        }
}
