import { GetStaticProps } from "next";
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Image from "next/image";

import heroImg from "../../public/assets/hero.png";

import { db } from "../services/firebaseConnection";

import { 
  collection,
  getDocs
} from "firebase/firestore";

interface HomeProps {
  post: number;
  comments: number;
}

export default function Home( { post, comments }: HomeProps ) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>

      <main>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo Tarefas+"
            src={heroImg}
            priority
          />
        </div>
        <h1 className={styles.title}>
          Sistema feito para voce organizar <br />
          seusz estudo e tarefas
        </h1>
        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+{post} Tarefas</span>
          </section>
          <section className={styles.box}>
            <span>+{comments} Comentários</span>
          </section>
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {

  const comentRef = collection(db, "comments");
  const postRef = collection(db, "tarefas")

  const comentSnapshot = await getDocs(comentRef);
  const postSnapshot = await getDocs(postRef)

  return {
    props: {
      post: postSnapshot.size || 0,
      comments: comentSnapshot.size || 0,
    },
    revalidate: 60,
  };
}