ALTER TABLE public.usuarios ADD COLUMN cpf character varying(255);
ALTER TABLE public.usuarios ADD COLUMN data_nascimento date;
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_cpf_key UNIQUE (cpf);
