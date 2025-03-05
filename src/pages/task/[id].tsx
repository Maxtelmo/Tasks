
import Head from "next/head";
import styles from "@/pages/task/styles.module.css";
import { GetServerSideProps } from "next";
import { FaTrash } from "react-icons/fa"

import { db } from "../../services/firebaseConnection"
import { 
    addDoc, 
    collection,
    query,
    where,
    doc,
    deleteDoc,
    getDoc,
    getDocs
} from "firebase/firestore"

import { Textarea } from "@/components/textarea";
import { useSession } from "next-auth/react";
import { ChangeEvent, FormEvent, useState } from "react";

interface TaskProps {
    item: {
        tarefa: string;
        created: string;
        public: boolean;
        user: string;
        taskid: string;
    };
    allcomments: allCommentsProps[];
}

interface allCommentsProps {
    id: string;
    taskid:string;
    createdComent: string;
    comments: string;
    user: string;
    name: string;
}

export default function Task( { item, allcomments }: TaskProps) {

    const { data: session } = useSession();
    const [input, setInput] = useState("");
    const [coments, setComents] = useState<allCommentsProps[]>(allcomments || [])



    async function handleEnviaComent(e: FormEvent){
        e.preventDefault();

        if (input === "") return;

        if (!session?.user?.email || !session?.user?.name) return;

        try {
            const docRef = await addDoc(collection(db, "comments"), {
                comments: input,
                createdComent: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskid: item?.taskid
            })

            const data = {
                id: docRef.id,
                comments: input,
                createdComent: (new Date()).toLocaleDateString(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskid: item?.taskid
            }

            setComents((ollItem) => [...ollItem, data]);
            setInput("");

        } catch(err) {
            console.log(err);
        }

    }

    async function handleDeleteComents(id: string) {
        try {
            const docRef = doc(db,"comments", id);

            await deleteDoc(docRef);

            const deleteComment = coments.filter((item) => item.id !== id);

            setComents(deleteComment);
            
            alert("Comentário Deletado!!!")
        } catch(err) {
            console.log(err)
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>
                    Detalhes da Tarefa
                </title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>

                <article className={styles.task}>
                    <p>
                        {item?.tarefa}
                    </p>
                </article>
            </main>

            <section className={styles.containerComent}>
                <h2 >Deixar seu Comentário:</h2>

                <form className={styles.form} onSubmit={handleEnviaComent}>
                    <Textarea
                        value={input}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                        placeholder="Digite Seus Comentários!!!"
                    />

                    <button
                        disabled={!session?.user}
                        className={styles.button}
                    >
                        Enviar Comentário
                    </button>
                </form>
            </section>

            <section className={styles.containerComent}>
                <h2>Comentários</h2>
                {coments.length === 0 && (
                    <span className={styles.span}>Nenhum Comentário para esta tarefa...</span>
                )}

                {coments.map((item) => (
                    <article key={item.id} className={styles.comment}>
                        <div className={styles.usuario}>
                            <label className={styles.label}>{item.name}</label>
                            {item.user === session?.user?.email && (
                                <button 
                                    className={styles.buttonTrash} 
                                    onClick={() => handleDeleteComents(item.id)}
                                >
                                    <FaTrash size={20} color=" #ea3140"/>
                                </button>
                            )}

                        </div>
                        <div><p>{item.comments}</p></div>
                        
                    </article>
                ))}
                <article></article>
            </section>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async  ({ params }) => {
    const id = params?.id as string;
    const docRef = doc(db, "tarefas", id);

    const q = query(collection(db, "comments"), where("taskid", "==", id))
    const snapShotComments = await getDocs(q);

    const allcomments: allCommentsProps[] = [];
    snapShotComments.forEach((doc) => {
        allcomments.push({
            id: doc.id,
            comments: doc.data().comments,
            user: doc.data().user,
            name: doc.data().name,
            createdComent: new Date((doc.data().createdComent.seconds) * 1000 ).toLocaleDateString(),
            taskid: doc.data().taskid,
        });
    });

    console.log(allcomments)

    const snapShot = await getDoc(docRef);


    if (snapShot.data() === undefined) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }
    
    if (!snapShot.data()?.public) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    const milessegundos = snapShot.data()?.created?.seconds * 1000;

    const task = {
        tarefa: snapShot.data()?.tarefa,
        created: new Date(milessegundos).toLocaleDateString(),
        public: snapShot.data()?.public,
        user: snapShot.data()?.user,
        taskid: id
        
    }

    return{
        props: {
            item: task,
            allcomments: allcomments,
        },
    }
}