const form1 = document.getElementById("formRegister");

const tp1 = document.getElementById("togglepassword1");
const tp2 = document.getElementById("togglepassword2");

// function para checar se a password inserida pelo user cumpre os requisitos 
function CheckPassword() 
{ 

    //Get da password 
    const senha = document.getElementById("password");
    //Get da confirmação da password 
    const senha2 = document.getElementById("password1");
    //Get do campo que será introduzido a mensagem de erro pro usuário
    const void1 = document.getElementById("void1");
    //Regex 
    var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    //Primeiro é feita a verificação das senhas, para ver se correspondem uma para a outra 
    if(senha.value == senha2.value)
    {
        //Em sequida é feito a comparação da senha com o regex para ver se cumpre os requisitos 
        if(senha.value.match(passw)) 
        { 
            //Caso cumpra é feito o submit da form de registo e enviado para o backend que validará a existência do email do usuario na base de dados 
            form1.submit()
            return true;
        }
        else
        { 
            //Se as senhas não comprirem os requisitos é enviado ao usuário as normas que são necessárias 
            void1.innerHTML = 'Insira uma senha de 6-20 caracteres, no mínimo 1 letra maiúscula e minúscula, um número e um caracter especial.';
            return false;
        }      
    }
    else{  
        //Caso as senhas estejam diferentes é enviado uma mensagem ao utilizador 
        void1.innerHTML = "Talvez as senhas estejam diferentes...";
        return false;
    }
}

//Essa function efetua o funcionamento do icon de eye presente do lado direito do campo password dando ao user a possibilidade de checar sua senha 
//numero = 1 -> password
//numero = 2 -> confirmação da password
function togglepassword(numero){

    //Propiedades do icon eye
    const s1= "m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z";
    const s2 =  "M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z";
    const s3 = "M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z";
    const s4 = "M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z";
    

    if(numero == 1){
        //Caso o numero enviado seja 1 é feita a definição das 5 variáveis a seguir
        var identify = document.getElementById("iconpassword").getAttribute("value");
        iconpass = document.getElementById("iconpassword");
        ss1 = document.getElementById("s1");
        ss2 = document.getElementById("s2");
        password = document.getElementById("password");
    }


    else if (numero == 2){
        //Caso o numero enviado seja 2 é feita a definição das 5 variáveis a seguir
        var identify = document.getElementById("iconpassword2").getAttribute("value");
        iconpass = document.getElementById("iconpassword2");
        ss1 = document.getElementById("s11");
        ss2 = document.getElementById("s22");
        password = document.getElementById("password1");

    }

    
    if (identify == 200) {
        //Mudança de value, type e dos icons 
        iconpass.className = "bi bi-eye-slash-fill";
        ss1.setAttribute("d", s1);
        ss2.setAttribute("d", s2);
        iconpass.setAttribute("value", 201);
        password.setAttribute("type", "text");
	} 

    
    if ( identify == 201){
        //Mudança de value, type e dos icons 
        iconpass.className = "bi bi-eye-fill";
        ss1.setAttribute("d", s3);
        ss2.setAttribute("d", s4);
        iconpass.setAttribute("value", 200);
        password.setAttribute("type", "password")
    }


}


function submitform(e){
    e.preventDefault();
    CheckPassword();
}

form1.addEventListener("submit", submitform, true);


