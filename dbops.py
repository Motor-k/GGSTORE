import hashlib
import math
import random
import string
import mysql.connector
from datetime import datetime

#Funcão responsável pela conecção a base de dados sempre q uma query for efetuada
def conector():
    mydb = mysql.connector.connect(
    host="localhost",
    port= 3306,
    password="Passw0rd",
    user="testuser",
    database = "ggstore"
    )
    mycursor = mydb.cursor()
    return mydb, mycursor


#Funcão responsável por criar o balanço do usuário (conta virtual para inserir dinheiro no futuro)
#Essa função é chamada dentro do registo, ou seja, sempre um usuário regista-se na Web App é criado para ele um balanço
def criar_balanco(email):
    mydb, mycursor = conector()
    sql2 = "select id_users from users where email=%s"
    format_list = [email]
    mycursor.execute(sql2, tuple(format_list))
    resultado = mycursor.fetchall()

    sql3 = "insert into balancos(fk_users, saldo) values (%s, 0.0)"
    format_list2 = [resultado[0][0]]
    mycursor.execute(sql3, format_list2)
    mydb.commit()
    mydb.close()  

def registo(datas):
    mydb, mycursor = conector()
    #Criação de caracteres diversos para criar o salt em seguida
    caracteres = string.ascii_letters+string.digits+string.punctuation
    #Criação do salt para a criação da password, essa criação é feita escolhendo 16 caracteres aleatórios da variavel acima
    #salt = ''.join(random.choices(caracteres, k=16))
    salt = ''.join(random.choices(caracteres, k=16))
    #Em seguida é criado o hash que é a junção da password inserida pelo user com o salt a formar um string composta, em seguida é feito a encriptação 
    hash = hashlib.sha256((str(salt)+str(datas[2].unescape())).encode(encoding= 'UTF-8'))

    User = { "nome": datas[0].unescape(),
    "email": datas[1].unescape(),
    "hash" : str(hash.digest()),
    "salt" : salt,
    "funcao": datas[3].unescape()
    }
    
    #if responsável pela verificação da quantidade de dados enviados pelo back-end
    if len(datas) == 4:
        data_formated = []

        for values in User.values():
            data_formated.append(values)

        data_formated = tuple(data_formated)

        #Os dados são tratados e é realizado a query de registo dentro do try logo abaixo
        sql = "INSERT INTO users (nome, email, password, salt, funcao) VALUES (%s, %s, %s, %s, %s)"

    try:
        mycursor.execute(sql,data_formated)
        mydb.commit()
        criar_balanco(User["email"])
        mydb.close()
        return False, "Usuário Registado"
       
    
    except Exception as e:
        mydb.close()
        return True, "Email já existe"

#Funcão responsável pelo login do usuário no site, seja editora ou user padrão  
def login(datas):
    mydb, mycursor = conector()
    #Query para verificar se o utilizador existe na base de dados
    sql = "SELECT * FROM users WHERE email = %s"
    lista= [datas[0].unescape()]
    mycursor.execute(sql,tuple(lista))
    resultado = mycursor.fetchall()
    
    #Se existir
    if len(resultado) > 0:
        #É feita a verificação da role do user
            #Se for user padrão
            if resultado[0][5] == "user":
                user = list(resultado[0])

                User = {"id": user[0],
                        "nome":user[1],
                        "email":user[2],
                        "password":user[3],
                        "salt":user[4],
                        "role": user[5]}
            
                hash = hashlib.sha256((str(User["salt"])+str(datas[1].unescape())).encode(encoding= 'UTF-8'))

                if str(User["password"]) == str(hash.digest()):
                    
                    mydb.close()
                    return True, User
                    

                else:
                    User = {"void"}
                    mydb.close()
                    return False, User
            #Se for developer
            elif resultado[0][5] == "editora":
                user = list(resultado[0])

                User = {"id": user[0],
                        "nome":user[1],
                        "email":user[2],
                        "password":user[3],
                        "salt":user[4],
                        "role": "dev"}
            
                hash = hashlib.sha256((str(User["salt"])+str(datas[1].unescape())).encode(encoding= 'UTF-8'))

                if str(User["password"]) == str(hash.digest()):
                    mydb.close()
                    #Retorna um estado True (Login efectuado) e os dados do user para a criação da session
                    return True, User
                else:
                    #Caso o utilizador n acerte a senha o estado volta como False e os dados voltam com uma mensagem "void"
                    User = {"void"}
                    mydb.close()
                    return False, User
            
    else:
        mydb.close()
        return False, User


def ler_jogos(page):
    mydb, mycursor = conector()
    sql = "select count(id_jogos) from jogos"
    mycursor.execute(sql)
    resultado=mycursor.fetchall()
    #Descobre quantas paginas será necessário conter para ter 15 jogos em cada pagina  
    calc1 = resultado[0][0]/15
    #Depois divide a quantidade de paginas que terá que ter pelo total para obter apenas 15 dados como limite
    calc = resultado[0][0]/calc1
    init = calc1*page


    #Query com um "limit", ou seja, a depender da página ele retornará 15 jogos diferente 
    sql1= "select * from jogos limit %s, %s"
    mycursor.execute(sql1, (math.ceil(init), math.ceil(calc)))
    #Obtem o nome das colunas
    columns = mycursor.column_names
    #Obtem os dados dos jogos 
    resultado1 = mycursor.fetchall()
    #Função jogo é criada e passada para um dict logo abaixo a coluna de key e os resultado como value
    jogos = []
    for a in range(0, len(resultado1)):
        jogos.append(dict(zip(columns, resultado1[a])))
        
    mydb.close()
    #Retorna o dict com os jogos e a quantidade de páginas que o programa deverá ter
    return jogos, calc

#Query de select ao saldo do user na table balancos
def ler_saldo(id_users):   
    mydb, mycursor = conector()
    sql = "select saldo from balancos where fk_users = %s"
    tuple1 = [id_users]
    mycursor.execute(sql, tuple(tuple1))
    resultado = mycursor.fetchall()

    mydb.close()
    return resultado

#Compra de um jogo
#Nesta operação o user compra um jogo de uma editora e o dinheiro é tranferido para a editora diretamente
def comprar_jogo(id_user, id_jogo):
    mydb, mycursor = conector()
    try:
        #Select do preço do jogo atualmente na base de dados
        sql = "select PriceFinal from jogos where ID_jogos = %s"
        lista = [id_jogo]
        mycursor.execute(sql, tuple(lista))
        resultado = mycursor.fetchall()
        valor_jogo = float(resultado[0][0])

        #Select do saldo atual do usuário que quer comprar o game
        sql = "select saldo from balancos where fk_users = %s"
        lista1 = [id_user]
        mycursor.execute(sql, tuple(lista1))
        resultado = mycursor.fetchall()
        saldo = float(resultado[0][0])

        #If para verificar se o usuário tem o saldo suficiente para comprar o jogo
        if saldo >= valor_jogo:

            today = datetime.now()
            #Insert da transacao efetuada na tabela transacoes
            sql = "insert into transacoes(fk_users, fk_jogos, data, valor) values (%s,%s,%s,%s)"
            format_list1 = [id_user, id_jogo, today, valor_jogo]
            mycursor.execute(sql, tuple(format_list1))

            #Calculo do valor que o usuário ficará depois de efetuar a compra
            valor_final_user = saldo-valor_jogo

            #Update do saldo do user que comprou o jogo
            sql = "update balancos set saldo = %s where fk_users = %s"
            format_list2 = [valor_final_user, id_user]
            mycursor.execute(sql, tuple(format_list2))

            #Select do id da editora responsável pelo jogo
            sql = "select us.id_users from (jogos jo inner join users us on jo.fk_users = us.id_users) where jo.id_jogos = %s and us.funcao = %s"
            format_list3 = [id_jogo, "editora"]
            mycursor.execute(sql, tuple(format_list3))
            resultado = mycursor.fetchall()
            resultado = resultado[0][0]
            #Depois que obtemos o ID da editora vamoos em busca do saldo atual da mesma
            sql = "select saldo from balancos where fk_users = %s"
            format_list4 = [resultado]
            mycursor.execute(sql, tuple(format_list4))
            saldo = mycursor.fetchall()
            saldo = saldo[0][0]

            valor_final_editora = saldo+valor_jogo
            #Uodate do usuário com role de "editora" para ser feito o incremento no seu saldo
            sql = "update balancos set saldo = %s where fk_users = %s"
            format_list = [valor_final_editora, resultado]
            mycursor.execute(sql, tuple(format_list))
            #Depois de todas essas operações é realizado um commit
            mydb.commit()
            mydb.close()
            return "A sua operação foi efectuada..."
        else:
            return "Sem saldo disponível"
    #Se der algum erro nessa function é feito um rollback, para voltar com dados anteriores
    except (IndexError ,mysql.connector.Error) as Error:
        mydb.rollback()
        mydb.close()
        match Error.args[0]:
            case "list index out of range":
                return "Talvez o Jogo não Exista"
            case _:
                return Error

#Query para buscar 
def historico_comentario(id_users):
    mydb, mycursor = conector()
    sql = "select group_concat(us.nome) as User, group_concat(gam.queryname) as Jogos, group_concat(com.avaliacao) as Avaliação, group_concat(com.data) as Data from ((comentarios com inner join jogos gam on com.fk_jogos = gam.id_jogos) inner join users us on com.fk_users = us.id_users) where com.fk_users = %s"
    format_list = [id_users]
    mycursor.execute(sql,tuple(format_list))
    columns = mycursor.column_names
    resultado = mycursor.fetchall()
    resultado = list(resultado[0])
    resultado[0] = resultado[0].split(",")
    resultado[1] = resultado[1].split(",")
    resultado[2] = resultado[2].split(",")
    resultado[3] = resultado[3].split(",")
    for a in range(0, len(resultado[3])):
        resultado[3][a] = datetime.strptime(str(resultado[3][a]),'%Y-%m-%d %H:%M:%S')
    
    
    historico = {columns[0] : resultado[0][0], 
                columns[1] : resultado[1], 
                columns[2] : resultado[2], 
                columns[3] : resultado[3]}

    #resultado = list(resultado[0])
    #resultado[3] = resultado[3].strftime("data: %d-%m-20%y às %H:%M:%S.%f")[:-7]
    mydb.close()
    return historico

#Inserção de um novo comentário
def inserir_comentario(id_users, id_jogos, comentario, avaliacao):
    mydb, mycursor = conector()
    sql = "insert into comentarios(fk_users, fk_jogos, comentario, data, avaliacao) values (%s, %s, %s, %s, %s)"
    today = datetime.now()
    format_list = [id_users, id_jogos, comentario, today, avaliacao]
    mycursor.execute(sql, tuple(format_list))
    mydb.commit()
    mydb.close()
    return 'A sua operação foi efectuada...'

#Delete do comentário
def delete_comentario(id_users, id_jogos):
    mydb, mycursor = conector()
    sql = "delete from comentarios where fk_users= %s and fk_jogos = %s"
    format_list = [id_users, id_jogos]
    mycursor.execute(sql, tuple(format_list))
    mydb.commit()
    mydb.close()
    return "A sua operação foi efectuada..."

#Função para verificar se o usuário possui o jogo e um comentário
def ler_jogo(id_jogos, id_user):
    mydb, mycursor = conector()
    #Se possuir o jogo e um comentário essa query é executada
    sql = "select group_concat(comentarios.comentario) as Comentarios, (sum(comentarios.avaliacao)/count(comentarios.avaliacao)) as Avaliação, group_concat(users.nome) as Nome from ((jogos inner join comentarios on jogos.id_jogos = comentarios.fk_jogos) inner join users on comentarios.fk_users = users.id_users) where jogos.id_jogos = %s and comentarios.fk_users = %s"
    format_list = [id_jogos, id_user]
    mycursor.execute(sql, tuple(format_list))
    columns = mycursor.column_names
    resultado = mycursor.fetchall()
    comentarios = {columns[0] : resultado[0][0],
                    columns[1] : resultado[0][1],
                    columns[2] : resultado[0][2],
                    "has_game" : True}

    if resultado[0][0] == None:
        sql = "select * from transacoes where fk_users = %s and fk_jogos = %s"
        format_list1 = [id_user, id_jogos]
        mycursor.execute(sql, tuple(format_list1))
        resultado1 = mycursor.fetchall()
        #Caso o usuário não tenha um jogo e nem um comentário
        if len(resultado1) == 0:
            comentarios['has_game'] = False
        #Caso o user tenha o jogo mas nenhum comentário no mesmo
        elif len(resultado1) > 0:
            comentarios['has_game'] = True

    mydb.close()  
    #Return do dict comentarios
    return comentarios

#Histórico de todos os comentários de um jogo
def historico_comentarios(id_jogo, page): 

    try:
        mydb, mycursor = conector()
        sql = "select count(comentario) from comentarios where fk_jogos = %s"
        format_list1 = [id_jogo]
        mycursor.execute(sql, tuple(format_list1))  
        resultado = mycursor.fetchall()
        count_comentario = int(resultado[0][0])
        #Caso tenha mais de 4 comentários no jogo
        if count_comentario > 4:

            calc1 = count_comentario/4
            calc = count_comentario/calc1
            init = calc1*page
            sql = "select group_concat(us.id_users) as Id_Users, group_concat(us.nome) as Users_Name, group_concat(com.comentario) as Comentarios, (sum(com.avaliacao)/count(com.avaliacao)) as AvaliacaoTotal, group_concat(com.avaliacao) as AvaliacaoIndividual from (comentarios com inner join users us on com.fk_users = us.id_users) where fk_jogos = %s limit %s, %s"
            format_list = [id_jogo, math.ceil(init), math.ceil(calc)]
            mycursor.execute(sql, tuple(format_list)) 
            comentarios = mycursor.fetchall()
            columns = mycursor.column_names
            resultado = list(comentarios[0])
        
            resultado[0] = resultado[0].split(",")
            resultado[1] = resultado[1].split(",")
            resultado[2] = resultado[2].split(",")
            resultado[3] = resultado[3]
            resultado[4] = resultado[4].split(",")

            dados = {columns[0] : resultado[0],
                        columns[1] : resultado[1],
                        columns[2] : resultado[2],
                        columns[3] : resultado[3],
                        columns[4] : resultado[4]}
            mydb.close()  
            #Retorna os dados da tabela comentario, a quantidade de comentarios e um calc com a quantidade de comentarios q tem que ter por página (igual ao ler_jogo)
            return dados, count_comentario, calc
        #Caso tenha menos ou igual a 4 comentários
        else:
            calc1 = count_comentario/1
            sql = "select group_concat(us.id_users) as Id_Users, group_concat(us.nome) as Users_Name, group_concat(com.comentario) as Comentarios, (sum(com.avaliacao)/count(com.avaliacao)) as AvaliacaoTotal, group_concat(com.avaliacao) as AvaliacaoIndividual from (comentarios com inner join users us on com.fk_users = us.id_users) where fk_jogos = %s"
            format_list = [id_jogo]
            mycursor.execute(sql, tuple(format_list))
            columns = mycursor.column_names
            comentarios = mycursor.fetchall()
            resultado = list(comentarios[0])

            resultado[0] = resultado[0].split(",")
            resultado[1] = resultado[1].split(",")
            resultado[2] = resultado[2].split(",")
            resultado[3] = resultado[3]
            resultado[4] = resultado[4].split(",")

            dados = {columns[0] : resultado[0],
                        columns[1] : resultado[1],
                        columns[2] : resultado[2],
                        columns[3] : resultado[3],
                        columns[4] : resultado[4]}
            mycursor.execute(sql, tuple(format_list))  
            comentarios = mycursor.fetchall()
            mydb.close()  
            #Retorna os dados da tabela comentario, a quantidade de comentarios e um calc1 com a quantidade de comentarios q tem que ter em uma página
            return dados, count_comentario, calc1

    except:
        return 0
 #Inserção de saldo na conta corrente do usuário
def inserir_saldo(id_user, valor_inserir):
    try:
        mydb, mycursor = conector()
        #Seleciona o valor q o usuário tem
        sql = "select saldo from balancos where fk_users = %s"
        lista1 = [id_user]
        mycursor.execute(sql, tuple(lista1))
        resultado = mycursor.fetchall()
        saldo = float(resultado[0][0])
        #Calcula a quantidade que o mesmo tem mais o valor a inserir
        saldo = saldo + valor_inserir

        #Update do saldo do usuário
        sql = "update (balancos inner join users us on balancos.fk_users = us.id_users) set saldo = %s where fk_users = %s and us.funcao = %s"
        format_list2 = [saldo, id_user, "user"]
        mycursor.execute(sql, tuple(format_list2))
        mydb.commit()
        mydb.close() 
        return 'A sua operação foi efectuada...'

    except Exception as e:
        mydb.close() 
        return e

#Histórico de todas as transações do usuário na Web App
def historico_transacoes(id_user):
    mydb, mycursor = conector()
    #Select para obter todos os dados das trasações
    sql = "select group_concat(tr.valor) as Valores, group_concat(tr.data) as Datas, group_concat(jo.QueryName) as Nome_Jogos, sum(tr.valor) as Valor_Gasto, count(tr.fk_users) as Quantidade_transacoes from (transacoes tr inner join jogos jo on tr.fk_jogos = jo.id_jogos) where tr.fk_users = %s"
    format_list = [id_user]
    mycursor.execute(sql, tuple(format_list))
    columns = mycursor.column_names
    resultado = mycursor.fetchall()
    resultado = resultado[0]
     
    datas = resultado[0].split(",")
    datas1 = resultado[1].split(",")   
    datas2 = resultado[2].split(",")

    #Select para obter a quantidade avaliação que um user realizou
    sql = "select count(avaliacao) as Quantidade_Avaliacoes from comentarios where fk_users = %s"
    format_list1 = [id_user]
    mycursor.execute(sql, tuple(format_list1))
    columns1 = mycursor.column_names
    resultado1 = mycursor.fetchall()
    resultado1 = resultado1[0][0]

    notificacao = {columns[0]: datas,
                   columns[1]: datas1,
                   columns[2]: datas2,
                   columns[3]: round(resultado[3],2),
                   columns[4]: resultado[4],
                   columns1[0]: resultado1}

 
    #Retorna as notificações que o usuário possui da table transacoes
    return notificacao
