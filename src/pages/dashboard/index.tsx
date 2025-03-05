import { GetServerSideProps } from "next"
import styles from "@/pages/dashboard/styles.module.css"
import Head from "next/head"


import { getSession } from "next-auth/react"
import { Textarea } from "@/components/textarea"
import { FiShare2 } from "react-icons/fi"
import { FaTrash } from "react-icons/fa"
import { ChangeEvent, FormEvent, useState, useEffect } from "react"

import { db } from "../../services/firebaseConnection"

import { 
    addDoc, 
    collection,
    query,
    orderBy,
    where,
    onSnapshot,
    doc,
    deleteDoc
} from "firebase/firestore"

import Link from "next/link"

interface HomeProps {
    user: {
        email: string;
    }
}

interface TaskProps {
    id: string;
    created: Date;
    public: boolean;
    tarefa: string;
    user: string;
}

export default function Dashboard({ user }:HomeProps ) {
    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);
    const [task, setTask] = useState<TaskProps[]>([]);

    useEffect(() => {
        async function loadTarefas() {

            const tarefasRef = collection(db, "tarefas");
            const q = query(
                tarefasRef,
                orderBy("created", "desc"),
                where("user", "==", user?.email)
            )
            onSnapshot(q, (snapShot) => {
                const lista = [] as TaskProps[];

                snapShot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        tarefa: doc.data().tarefa,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public
                    });
                });

                setTask(lista)
            });
        }

        loadTarefas();
    },[user?.email]);

    function handleChangePublic( e: ChangeEvent<HTMLInputElement>) {
        // console.log(e.target.checked)
        setPublicTask(e.target.checked);
    }

    async function handleRegisterTask( e: FormEvent){
        e.preventDefault();

        if ( input === "") {
            return
        } else {
            try {
                await addDoc(collection(db, "tarefas"), {
                        tarefa: input,
                        created: new Date(),
                        user: user?.email,
                        public: publicTask,
                });

                setInput("");
                setPublicTask(false);

            } catch(err) {
                console.log(err);
            }
        }
    }

    async function handleShare( id: string){
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        );
        alert("URL Copiada com Sucesso!")
    }

    async function handleDelete(id: string) {
        const docRef = doc(db, "tarefas", id)

        await deleteDoc(docRef)
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Meu Painel de Tarefas</title>
            </Head>
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}> Qual sua Tarefa?</h1>

                        <form onSubmit={handleRegisterTask}>
                            <Textarea 
                                placeholder="Digite qual sua Tarefa"
                                value={input}
                                onChange={ (e: ChangeEvent<HTMLTextAreaElement>) =>
                                    setInput(e.target.value)}
                            />
                            <div className={styles.checkboxarea}>
                                <input 
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={handleChangePublic}
                                />
                                <label>Deixar tarefa publica?</label>
                            </div>

                            <button type="submit" className={styles.button}>
                                Registrar
                            </button>
                        </form>
                        
                    </div>
                </section>
                <section className={styles.taskContainer}>
                    <h1>Minhas Tarefas</h1>

                    {task.map((item) => (
                        <article  key={item.id} className={styles.task}>
                            {item.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>PUBLICO</label>
                                    <button className={styles.shareButton} onClick={ () => handleShare(item.id) }>
                                        <FiShare2 
                                            size={22} 
                                            color=" #3183ff" 
                                        />
                                    </button>
                                </div>
                            )}
                        

                        <div className={styles.taskContent}>
                            
                            {item.public ? (
                                <Link href={`/task/${item.id}`}>
                                    <p>{item.tarefa}</p>
                                </Link>
                            ) : (
                                <p>{item.tarefa}</p>
                            )};
                            
                            <button className={styles.trashButton} onClick={() => handleDelete(item.id)}>
                            <FaTrash 
                                    size={24} 
                                    color=" #ea3140" 
                                />
                            </button>
                        </div>
                    </article>
                    ))}

                </section>
            </main>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });

    if (!session?.user) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    return {
        props: {
            user: {
                email: session?.user?.email,
            }
        },
    };
}