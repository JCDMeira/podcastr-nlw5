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

import {GetStaticProps} from 'next';
import Image from 'next/image';
import {format, parseISO} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss';

type Episode={
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type HomeProps ={
  latesEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({latesEpisodes, allEpisodes}: HomeProps) {
  console.log(latesEpisodes);
  return (
    <div className={styles.homePage}>
      <section className={styles.latesEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
        {latesEpisodes.map(episode =>{
            return(
              <li key={episode.id}>
                <Image 
                width={192} 
                height={192} 
                src={episode.thumbnail} 
                alt={episode.title}
                objectFit="cover"
              />

                <div className={styles.episodeDetails}>
                  <a href="">{episode.title}</a>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button">
                  <img src="/play-green.svg" alt="Tocar episódio"/>
                </button>
              </li>
            )
          })}
        </ul>

      </section>
      
      <section className={styles.allEpisodes}>
          <h2>Todos episódios</h2>

          <table cellSpacing={0}>
          <thead>
            <th></th>
            <th>Podcast</th>
            <th>Integrantes</th>
            <th>Data</th>
            <th>Duração</th>
            <th></th>
          </thead>
          <tbody>
            {allEpisodes.map(episode => {
              return(
                <tr key={episode.id}>
                  <td style={{width: 72}}>
                    <Image 
                    width={120} 
                    height={120}
                    src={episode.thumbnail}
                    alt={episode.title}
                    objectFit="cover"
                    />
                  </td>
                  <td>
                    <a href="">{episode.title}</a>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{width: 100}}>{episode.publishedAt}</td>
                  <td>{episode.duration}</td>
                  <td>
                    <button type="button">
                      <img src="/play-green.svg" alt="Tocar episódio"/>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          </table>
      </section>
    </div>
  )
}

export  const getStaticProps : GetStaticProps = async ()=>{
  
  //_ Chama a API e busca os dados
  const {data} = await api.get('episodes',{
    params:{
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  //_ Formata os dados, para que não fique a formatação no return
  const episodes= data.map(episode => {
    return{
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR}),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      descripton: episode.description,
      url: episode.file.url,
    }
  })

  const latesEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return{
    props:{
      latesEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8, //_ gera nova versão
  }
}