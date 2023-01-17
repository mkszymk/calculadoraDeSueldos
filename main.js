const apJubilatorio = 0.15;
const apSalud = 0.045;
const apFrl = 0.001;
const valorBPC = 5164;
const cotDolarUy = 39;

const resultDiv = document.querySelector("#result");
const form = document.querySelector(".formulario");
const formNombre = document.querySelector("#name");
const formSueldo = document.querySelector("#sueldo");
const formEsExtranjero = document.querySelector("#nacionalidad");
const errorElement = document.querySelector("#error");
const clearBtn = document.querySelector("#clearBtn");
const loadLiqs = document.querySelector("#loadLiqs");


class Persona{
    constructor(nombre, sueldo, esExtranjero){
        this.nombre = nombre;
        this.sueldo = sueldo;
        this.esExtranjero = esExtranjero;
    }
}

function showError(status){
    if(status){
        errorElement.style.display = "block";
    } else{
        errorElement.style.display = "none";
    }
}

function showResult(persona, liquido, aportes, impuestos, toStorage){
        resultDiv.innerHTML += `
        <div class="indivResult">
            <p>${persona.nombre}</p>
            <p>${parseFloat(persona.sueldo).toLocaleString()}</p>
            <p>${persona.esExtranjero ? "Extranjero" : "Uruguayo"}</p>
            <p>${parseFloat(-aportes).toLocaleString()}</p>
            <p>${persona.esExtranjero ? "IRNR" : "IRPF"}</p>
            <p>${(-impuestos).toLocaleString()}</p>
            <p>${parseFloat(liquido).toLocaleString()}</p>
        </div>
        `;
        if(toStorage){
            const rowAdded = {
                person: persona,
                personLiquido: liquido,
                personAportes: aportes,
                personImpuestos: impuestos
            };
            addRowToStorage(rowAdded);
        }
}

function clearList(){
    resultDiv.innerHTML = "";
    localStorage.removeItem('rows');
}

function loadList(){
    const listInStorage = JSON.parse(localStorage.getItem('rows'));
    if(listInStorage !== null){
        listInStorage.forEach(row => {
            showResult(row.person, row.personLiquido, row.personAportes, row.personImpuestos, false);
        });
    }
 }

function addRowToStorage(rowObject){
    if(localStorage.getItem('rows') === null){
        localStorage.setItem('rows', JSON.stringify([rowObject]));
    }else{
        const previousRows = JSON.parse(localStorage.getItem('rows'));
        previousRows.push(rowObject);
        localStorage.setItem('rows', JSON.stringify(previousRows));
    }
}

const deducciones = (sueldo, montoAportes) => {
    return (sueldo > 15*valorBPC) ? (montoAportes * 0.08) : (montoAportes * 0.1);
}

const montoImponibleIRPF = (sueldo) => {
    return (sueldo > 10*valorBPC) ? (sueldo * 1.06) : (sueldo);
}

const aporteJubilatorio = (sueldo) => {
    if (sueldo > 215179){
        return 215179 * apJubilatorio;
    } else{
        return sueldo * apJubilatorio;
    }
}

const liquidacionIRNR = (sueldo) => {
    //IRNR es el impuesto que los extranjeros pagan si trabajan en Uruguay, siempre es 12%. El IRPF solo lo pagan los uruguayos, y el porcentaje es progresivo.
    return sueldo * 0.12;
}

const liquidacionIRPF = (sueldo) => {

    const aportes = (sueldo * (apSalud + apFrl)) + aporteJubilatorio(sueldo);
    const montoDeducciones = deducciones(sueldo, aportes);
    const imponibleIRPF = montoImponibleIRPF(sueldo);

    if(imponibleIRPF <= (7*valorBPC)){
        return 0;
    }else{
        
        let primarioIRPF = 0;

        for(let i = 0; i <= imponibleIRPF; i++){

            if(i < 7 * valorBPC){
                primarioIRPF += 0;
            } else if(i <= 10 * valorBPC && i > 7 * valorBPC){
                primarioIRPF += 0.1;
            }else if(i <= 15 * valorBPC && i > 10 * valorBPC){
                primarioIRPF += 0.15;
            }else if(i <= 30 * valorBPC && i > 15 * valorBPC){
                primarioIRPF += 0.24;
            }else if(i <= 50 * valorBPC && i > 30 * valorBPC){
                primarioIRPF += 0.25;
            }else if(i <= 75 * valorBPC && i > 50 * valorBPC){
                primarioIRPF += 0.27;
            }else if(i <= 115 * valorBPC && i > 75 * valorBPC){
                primarioIRPF += 0.31;
            }else if(i > 115 * valorBPC){
                primarioIRPF += 0.36;
            }
        }

        return primarioIRPF - montoDeducciones;

    }
}

function liquidarSueldo(persona){
    const sueldo = persona.sueldo;

    if(persona.esExtranjero){
        const irnrAPagar = liquidacionIRNR(sueldo);

        return Math.round(persona.sueldo - irnrAPagar);
    }else{
        const aportes = (sueldo * (apSalud + apFrl)) + aporteJubilatorio(sueldo);
        const irpfAPagar = liquidacionIRPF(sueldo);

        return Math.round(sueldo - aportes - irpfAPagar);
    }

}

form.onsubmit = (event) => {
    event.preventDefault();
    const nombreEnviado = formNombre.value;
    const sueldoEnviado = formSueldo.value;
    const nacionalidadEnviadaExtranjero = formEsExtranjero.checked;
    if(sueldoEnviado <= 0 || isNaN(sueldoEnviado)){
        showError(true);
    }else if(nombreEnviado == ""){
        Swal.fire(
            'Error',
            'El nombre no puede estar vacío',
            'error'
          );
    }else{
        showError(false);
        const p = new Persona(nombreEnviado, sueldoEnviado, nacionalidadEnviadaExtranjero);
        const sueldoLiquido = liquidarSueldo(p);
        const impuestos = nacionalidadEnviadaExtranjero ? (liquidacionIRNR(p.sueldo).toFixed(0)) : (liquidacionIRPF(p.sueldo).toFixed(0));
        const aportes = nacionalidadEnviadaExtranjero ? (0) : (((p.sueldo * (apSalud + apFrl)) + aporteJubilatorio(p.sueldo)).toFixed(0));
        showResult(p, sueldoLiquido, aportes, impuestos, true);

        form.reset()
    }
}

clearBtn.addEventListener("click",() => {
    Swal.fire({
        title: 'Confirmar',
        text: '¿Deseas borrar todas las liquidaciones?',
        icon: 'warning',
        showDenyButton: true,
        confirmButtonText: 'Sí',
        denyButtonText: 'No'
      }).then(respuesta => {
        if(respuesta.isConfirmed){
            clearList();
            Swal.fire('Liquidaciones limpiadas!', '', 'success');
        }
      });
});

loadLiqs.addEventListener("click", () => {
    Swal.fire({
        title: 'Cargar',
        text: '¿Deseas cargar las liquidaciones de prueba? Las mismas sobreescribirán cualquier otra liquidación que esté en la tabla.',
        showDenyButton: true,
        confirmButtonText: 'Sí, cargar',
        denyButtonText: 'Cancelar'
    }).then(res => {
        if(res.isConfirmed){
            clearList();
            fetch('./assets/liquidaciones.json')
            .then( (res) => res.json())
            .then( (data) => {
                data.forEach(liq => {
                    showResult(liq.person, liq.personLiquido, liq.personAportes, liq.personImpuestos, true);
                });
                Swal.fire('Éxito al cargar')
            });
        }
    });

});

loadList();



