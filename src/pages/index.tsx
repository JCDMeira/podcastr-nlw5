/*
    ! SPA
      _Importe o useEffect
        import { useEffect } from "react"
      _ Faça a requisição Fetch
          useEffect(()=> {
          fetch('http://localhost:3333/episodes')
            .then(response => response.json())
            .then(data => console.log(data))
            }, []
          ) //_ para efeitos colaterias, quando algo mudar, algo deve acontecer
      
      #Nota# Ao usar esse modelo de consumo de informações os dados só serão renderizados
      _ ao acessar a página, o que faz com que os buscadores não consigam indexar a informação.

    ! SSR
    
      _ Adicionar a função em qualquer página, seguindo o seguinte formato
        export async function getServerSideProps(){
          const response = await fetch('http://localhost:3333/episodes')
          const data = await response.json()

          return{
            props:{
              episodes: data,
            }
          }
        }
      _ Consumir os dados conforme abaixo

        export default function Home(props) {
          console.log(props.episodes);
          
          return (
            <div>
              <h1>Header</h1>
              <p>{JSON.stringify(props.episodes)} </p>
            </div>
          )
        }
      
      #Nota# O modelo de consumo do SSR faz com que toda vez que o site é acessado
      _ os dados serão buscados, e isso fará com que o site esteja em tempo real, mas nem 
      _ todo site precisa dessa acurácia em tempo real, e isso pode causar um número 
      _ grande de requisições.

    ! SSG
      _ Adicionar a função em qualquer página, seguindo o seguinte formato
        export async function getStaticProps(){
          const response = await fetch('http://localhost:3333/episodes')
          const data = await response.json()

          return{
            props:{
              episodes: data,
            },
            revalidate: 60 * 60 * 8, //_ gera nova versão
          }
        }

      _ Consumir os dados conforme abaixo

      export default function Home(props) {
        console.log(props.episodes);
        
        return (
          <div>
            <h1>Header</h1>
            <p>{JSON.stringify(props.episodes)} </p>
          </div>
        )
      }

      #Nota# O modelo de consumo do SSG fará que após uma pessoa acessar, será gerado um
      _ modelo statico de página, com HTML puro, e esse modelo será servido a todos outros
      _ clientes que acessarem a página após essa pessoa.
      _ E somente será atualizado com o tempo marcado. Assim terá economia de recursos e se 
      _ torna mais performático. Todos acessando o mesmo HTML estático gerado.  
*/

export default function Home(props) {
  console.log(props.episodes);
  
  return (
    <div>
      <h1>Header</h1>
      <p>{JSON.stringify(props.episodes)} </p>
    </div>
  )
}

export async function getStaticProps(){
  const response = await fetch('http://localhost:3333/episodes')
  const data = await response.json()

  return{
    props:{
      episodes: data,
    },
    revalidate: 60 * 60 * 8, //_ gera nova versão
  }
}