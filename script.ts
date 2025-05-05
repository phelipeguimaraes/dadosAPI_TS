const dadosBody = document.querySelector<HTMLDivElement>('.dadosBody')
const moneyTotal = document.querySelector<HTMLSpanElement>('.moneyTotal')
const creditoTotal = document.querySelector<HTMLSpanElement>(".creditoTotal")
const boletoTotal = document.querySelector<HTMLSpanElement>(".boletoTotal")
const pagasTotal = document.querySelector<HTMLSpanElement>('.pagasTotal')
const recuseCard = document.querySelector<HTMLSpanElement>('.recuseCard')
const aguardandoPay = document.querySelector<HTMLSpanElement>('.aguardandoPay')
const estornadaPay = document.querySelector<HTMLSpanElement>('.estornadaPay')
const diasComMaisVendas = document.querySelector<HTMLSpanElement>(".diasComMaisVendas")

async function fetchData() {
   const response = await fetch("https://api.origamid.dev/json/transacoes.json")
   const data = await response.json()
   handleData(data)
}

fetchData()

interface Dados {
   status: string,
   id: number,
   data: string,
   nome: string,
   formaDePagamento: string,
   email: string,
   valor: string,
   clienteNovo: number
}

function normazlizeData(data: any) : Dados {
   return {
      status: data.Status,
      id: data.ID,
      data: data.Data,
      nome: data.Nome,
      formaDePagamento: data["Forma de Pagamento"],
      email: data.Email,
      valor: data["Valor (R$)"],
      clienteNovo: data["Cliente Novo"]
   }
}

function isDados(value: unknown) : value is Dados {
   if(value && typeof value === "object" && "nome" in value) {
      return true
   } else {
      return false
   }
}

function handleData(datas: unknown[]) {
   
   const normalized = datas.map(normazlizeData)
   
   normalized.forEach(data => {
      if(isDados(data) && dadosBody) {
         let row = document.createElement('div')
         row.className = "dadosRow"

         row.innerHTML = `
            <p>${data.nome}</p>
            <p>${data.email}</p>
            <p>R$ ${data.valor}</p>
            <p>${data.formaDePagamento}</p>
            <p>${data.status}</p>
         `

         dadosBody.appendChild(row)

      } else {
         console.log(null)
      }
   })

   if(moneyTotal) {

      let total = 0

      normalized.forEach(data => {
         if(isDados(data)) {

           if(data.valor === "-") {
            return
           } else {
              total += parseFloat(data.valor.replace(/\./g, "").replace(",", ".").trim())
            
           }

         }
         else {
            console.log(null)
         }
      })

      if(creditoTotal && boletoTotal && pagasTotal && recuseCard && aguardandoPay && estornadaPay) {
         let cardCredit = 0
         let boleto = 0
         let pagas = 0
         let recusada = 0
         let aguardandoPayTotal = 0
         let estornadaTotal = 0

         normalized.map(data => {
            if(isDados(data)) {
               if(data.formaDePagamento === "Cartão de Crédito") {
                  cardCredit += 1
               } if (data.formaDePagamento === "Boleto") {
                  boleto += 1
               } if (data.status === "Paga") {
                  pagas += 1
               } if (data.status === "Recusada pela operadora de cartão") {
                  recusada += 1
               } if(data.status === "Aguardando pagamento") {
                  aguardandoPayTotal += 1
               } if (data.status === "Estornada") {
                  estornadaTotal += 1
               }

            } else {
               console.log(null)
            }
         })

         creditoTotal.innerText = `${cardCredit}`
         boletoTotal.innerText = `${boleto}`
         pagasTotal.innerText = `${pagas}`
         recuseCard.innerText = `${recusada}`
         aguardandoPay.innerText = `${aguardandoPayTotal}`
         estornadaPay.innerText = `${estornadaTotal}`
         
      }

      moneyTotal.innerText = `${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}`
   }

   const contador: Record<string, number> = {};

   normalized.forEach(data => {
      if(isDados(data)) {
        const dataOriginal = data.data

         // Converter para formato aceito pelo JavaScript (aaaa-mm-dd)
         const [dia, mes, anoHora] = dataOriginal.split("/")
         const [ano, hora] = anoHora.split(" ")
         const dataFormatada = new Date(`${ano}-${mes}-${dia}T${hora}`)

         // Obter o dia da semana
         const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
         const diaDaSemana = diasSemana[dataFormatada.getDay()]
         
         // contador de dias
         contador[diaDaSemana] = (contador[diaDaSemana] || 0) + 1;

      } else{
         console.log(null)
      }
   })


   let diaMaisVendido = '';
   let max = 0;
   for (const dia in contador) {
     if (contador[dia] > max) {
       max = contador[dia];
       diaMaisVendido = dia;
     }
   }

   if(diasComMaisVendas) {
      diasComMaisVendas.innerText = `${diaMaisVendido}`
   }

}