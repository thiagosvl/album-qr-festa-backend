export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      festa_catalogo_extras_b2c: {
        Row: {
          ativo: boolean
          created_at: string
          custo_creditos_b2b: number
          descricao: string | null
          disponivel_b2b: boolean
          efeito_tipo: Database["public"]["Enums"]["festa_efeito_extra_enum"]
          efeito_valor: number
          id: string
          nome: string
          ordem: number
          preco_centavos: number
          slug: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          custo_creditos_b2b?: number
          descricao?: string | null
          disponivel_b2b?: boolean
          efeito_tipo?: Database["public"]["Enums"]["festa_efeito_extra_enum"]
          efeito_valor?: number
          id?: string
          nome: string
          ordem?: number
          preco_centavos: number
          slug: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          custo_creditos_b2b?: number
          descricao?: string | null
          disponivel_b2b?: boolean
          efeito_tipo?: Database["public"]["Enums"]["festa_efeito_extra_enum"]
          efeito_valor?: number
          id?: string
          nome?: string
          ordem?: number
          preco_centavos?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      festa_catalogo_pacotes_b2c: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          dias_galeria_ativa: number
          id: string
          inclui_qr_tematico: boolean
          inclui_telao: boolean
          limite_molduras: number
          nome_exibicao: string
          ordem: number
          permite_video: boolean
          preco_ancora_centavos: number | null
          preco_centavos: number
          tipo_pacote: Database["public"]["Enums"]["festa_pacote_tipo_enum"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          dias_galeria_ativa?: number
          id?: string
          inclui_qr_tematico?: boolean
          inclui_telao?: boolean
          limite_molduras?: number
          nome_exibicao: string
          ordem?: number
          permite_video?: boolean
          preco_ancora_centavos?: number | null
          preco_centavos: number
          tipo_pacote: Database["public"]["Enums"]["festa_pacote_tipo_enum"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          dias_galeria_ativa?: number
          id?: string
          inclui_qr_tematico?: boolean
          inclui_telao?: boolean
          limite_molduras?: number
          nome_exibicao?: string
          ordem?: number
          permite_video?: boolean
          preco_ancora_centavos?: number | null
          preco_centavos?: number
          tipo_pacote?: Database["public"]["Enums"]["festa_pacote_tipo_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      festa_catalogo_planos_b2b: {
        Row: {
          ativo: boolean
          created_at: string
          creditos_mensais: number
          custo_creditos_basico: number
          custo_creditos_completo: number
          descricao: string | null
          id: string
          nome: string
          ordem: number
          preco_credito_avulso_centavos: number
          preco_mensal_centavos: number
          preco_unitario_basico_centavos: number | null
          preco_unitario_completo_centavos: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          creditos_mensais?: number
          custo_creditos_basico?: number
          custo_creditos_completo?: number
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number
          preco_credito_avulso_centavos?: number
          preco_mensal_centavos?: number
          preco_unitario_basico_centavos?: number | null
          preco_unitario_completo_centavos?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          creditos_mensais?: number
          custo_creditos_basico?: number
          custo_creditos_completo?: number
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
          preco_credito_avulso_centavos?: number
          preco_mensal_centavos?: number
          preco_unitario_basico_centavos?: number | null
          preco_unitario_completo_centavos?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      festa_catalogo_produtos: {
        Row: {
          ativo: boolean
          codigo_modulo: Database["public"]["Enums"]["festa_codigo_modulo_enum"]
          created_at: string
          custo_creditos_b2b: number
          descricao: string | null
          dias_validade_base: number
          disponivel_b2b: boolean
          id: string
          limite_molduras_base: number
          nome_exibicao: string
          ordem: number
          preco_ancora_centavos: number | null
          preco_centavos: number
          slug: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo_modulo: Database["public"]["Enums"]["festa_codigo_modulo_enum"]
          created_at?: string
          custo_creditos_b2b?: number
          descricao?: string | null
          dias_validade_base?: number
          disponivel_b2b?: boolean
          id?: string
          limite_molduras_base?: number
          nome_exibicao: string
          ordem?: number
          preco_ancora_centavos?: number | null
          preco_centavos?: number
          slug: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo_modulo?: Database["public"]["Enums"]["festa_codigo_modulo_enum"]
          created_at?: string
          custo_creditos_b2b?: number
          descricao?: string | null
          dias_validade_base?: number
          disponivel_b2b?: boolean
          id?: string
          limite_molduras_base?: number
          nome_exibicao?: string
          ordem?: number
          preco_ancora_centavos?: number | null
          preco_centavos?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      festa_evento_confirmacoes: {
        Row: {
          adultos: number
          created_at: string
          criancas: number
          evento_id: string
          id: string
          nome: string
          nomes_adultos: string[]
          nomes_criancas: string[]
          updated_at: string
        }
        Insert: {
          adultos?: number
          created_at?: string
          criancas?: number
          evento_id: string
          id?: string
          nome: string
          nomes_adultos?: string[]
          nomes_criancas?: string[]
          updated_at?: string
        }
        Update: {
          adultos?: number
          created_at?: string
          criancas?: number
          evento_id?: string
          id?: string
          nome?: string
          nomes_adultos?: string[]
          nomes_criancas?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "festa_evento_confirmacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "festa_eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_evento_extras: {
        Row: {
          created_at: string
          custo_creditos_b2b: number
          entregue: boolean
          evento_id: string
          extra_id: string | null
          id: string
          nome: string
          preco_unitario_centavos: number
          quantidade: number
        }
        Insert: {
          created_at?: string
          custo_creditos_b2b?: number
          entregue?: boolean
          evento_id: string
          extra_id?: string | null
          id?: string
          nome: string
          preco_unitario_centavos?: number
          quantidade?: number
        }
        Update: {
          created_at?: string
          custo_creditos_b2b?: number
          entregue?: boolean
          evento_id?: string
          extra_id?: string | null
          id?: string
          nome?: string
          preco_unitario_centavos?: number
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "festa_evento_extras_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "festa_eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festa_evento_extras_extra_id_fkey"
            columns: ["extra_id"]
            isOneToOne: false
            referencedRelation: "festa_catalogo_extras_b2c"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_evento_midias: {
        Row: {
          autor: string | null
          created_at: string
          curtidas: number
          duracao_segundos: number | null
          evento_id: string
          fixada_demo: boolean
          id: string
          moldura_id: string | null
          path: string
          sessao_id: string | null
          status_moderacao: Database["public"]["Enums"]["festa_status_moderacao_enum"]
          tamanho_bytes: number | null
          thumb_path: string | null
          tipo_midia: Database["public"]["Enums"]["festa_tipo_midia_enum"]
        }
        Insert: {
          autor?: string | null
          created_at?: string
          curtidas?: number
          duracao_segundos?: number | null
          evento_id: string
          fixada_demo?: boolean
          id?: string
          moldura_id?: string | null
          path: string
          sessao_id?: string | null
          status_moderacao?: Database["public"]["Enums"]["festa_status_moderacao_enum"]
          tamanho_bytes?: number | null
          thumb_path?: string | null
          tipo_midia?: Database["public"]["Enums"]["festa_tipo_midia_enum"]
        }
        Update: {
          autor?: string | null
          created_at?: string
          curtidas?: number
          duracao_segundos?: number | null
          evento_id?: string
          fixada_demo?: boolean
          id?: string
          moldura_id?: string | null
          path?: string
          sessao_id?: string | null
          status_moderacao?: Database["public"]["Enums"]["festa_status_moderacao_enum"]
          tamanho_bytes?: number | null
          thumb_path?: string | null
          tipo_midia?: Database["public"]["Enums"]["festa_tipo_midia_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "festa_evento_midias_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "festa_eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festa_evento_midias_moldura_id_fkey"
            columns: ["moldura_id"]
            isOneToOne: false
            referencedRelation: "festa_evento_molduras"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_evento_molduras: {
        Row: {
          arquivo_path: string
          ativa: boolean
          created_at: string
          evento_id: string
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          arquivo_path: string
          ativa?: boolean
          created_at?: string
          evento_id: string
          id?: string
          nome: string
          ordem?: number
        }
        Update: {
          arquivo_path?: string
          ativa?: boolean
          created_at?: string
          evento_id?: string
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "festa_evento_molduras_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "festa_eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_evento_produtos: {
        Row: {
          codigo_modulo: Database["public"]["Enums"]["festa_codigo_modulo_enum"]
          created_at: string
          custo_creditos_b2b: number
          evento_id: string
          id: string
          nome: string
          preco_centavos: number
          produto_id: string | null
        }
        Insert: {
          codigo_modulo: Database["public"]["Enums"]["festa_codigo_modulo_enum"]
          created_at?: string
          custo_creditos_b2b?: number
          evento_id: string
          id?: string
          nome: string
          preco_centavos?: number
          produto_id?: string | null
        }
        Update: {
          codigo_modulo?: Database["public"]["Enums"]["festa_codigo_modulo_enum"]
          created_at?: string
          custo_creditos_b2b?: number
          evento_id?: string
          id?: string
          nome?: string
          preco_centavos?: number
          produto_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "festa_evento_produtos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "festa_eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festa_evento_produtos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "festa_catalogo_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_eventos: {
        Row: {
          anfitriao_id: string | null
          ativo: boolean
          boas_vindas: string | null
          capa_url: string | null
          codigo_url: string
          convite_audio_obrigado_url: string | null
          convite_banner_topo_url: string | null
          convite_endereco: string | null
          convite_exibir_presentes: boolean
          convite_foto_url: string | null
          convite_horario_inicio: string | null
          convite_horario_texto: string | null
          convite_ideias_presentes: string[]
          convite_musica_url: string | null
          convite_nome_local: string | null
          convite_tamanho_calcado: string | null
          convite_tamanho_roupa: string | null
          convite_texto_chamada: string | null
          convite_texto_prazo_rsvp: string | null
          convite_titulo_tamanhos: string | null
          convite_whatsapp_contato: string | null
          cor_primaria: string
          cor_secundaria: string
          created_at: string
          creditos_b2b_consumidos: number
          data_evento: string | null
          desconto_centavos: number
          expira_em: string | null
          galeria_publica: boolean
          id: string
          idade_aniversariante: string | null
          inclui_convite: boolean
          inclui_galeria: boolean
          inclui_telao: boolean
          is_demo: boolean
          limite_molduras: number
          metodo_pagamento: Database["public"]["Enums"]["festa_metodo_pagamento_enum"]
          moderacao_previa: boolean
          nome_aniversariante: string | null
          observacoes_internas: string | null
          pacote: Database["public"]["Enums"]["festa_pacote_tipo_enum"] | null
          parceiro_id: string | null
          permite_envio_midias: boolean
          permite_video: boolean
          pix_copia_cola: string | null
          pix_txid: string | null
          qr_code_pdf_url: string | null
          slug: string
          status_pedido: Database["public"]["Enums"]["festa_status_pedido_enum"]
          subtitulo: string | null
          tema_id: string | null
          tempo_slideshow_segundos: number
          titulo: string
          token_gestao: string
          updated_at: string
          valor_extras_centavos: number
          valor_pacote_centavos: number
          valor_pago_centavos: number
          valor_sinal_centavos: number
          valor_total_centavos: number
        }
        Insert: {
          anfitriao_id?: string | null
          ativo?: boolean
          boas_vindas?: string | null
          capa_url?: string | null
          codigo_url?: string
          convite_audio_obrigado_url?: string | null
          convite_banner_topo_url?: string | null
          convite_endereco?: string | null
          convite_exibir_presentes?: boolean
          convite_foto_url?: string | null
          convite_horario_inicio?: string | null
          convite_horario_texto?: string | null
          convite_ideias_presentes?: string[]
          convite_musica_url?: string | null
          convite_nome_local?: string | null
          convite_tamanho_calcado?: string | null
          convite_tamanho_roupa?: string | null
          convite_texto_chamada?: string | null
          convite_texto_prazo_rsvp?: string | null
          convite_titulo_tamanhos?: string | null
          convite_whatsapp_contato?: string | null
          cor_primaria?: string
          cor_secundaria?: string
          created_at?: string
          creditos_b2b_consumidos?: number
          data_evento?: string | null
          desconto_centavos?: number
          expira_em?: string | null
          galeria_publica?: boolean
          id?: string
          idade_aniversariante?: string | null
          inclui_convite?: boolean
          inclui_galeria?: boolean
          inclui_telao?: boolean
          is_demo?: boolean
          limite_molduras?: number
          metodo_pagamento?: Database["public"]["Enums"]["festa_metodo_pagamento_enum"]
          moderacao_previa?: boolean
          nome_aniversariante?: string | null
          observacoes_internas?: string | null
          pacote?: Database["public"]["Enums"]["festa_pacote_tipo_enum"] | null
          parceiro_id?: string | null
          permite_envio_midias?: boolean
          permite_video?: boolean
          pix_copia_cola?: string | null
          pix_txid?: string | null
          qr_code_pdf_url?: string | null
          slug: string
          status_pedido?: Database["public"]["Enums"]["festa_status_pedido_enum"]
          subtitulo?: string | null
          tema_id?: string | null
          tempo_slideshow_segundos?: number
          titulo: string
          token_gestao?: string
          updated_at?: string
          valor_extras_centavos?: number
          valor_pacote_centavos?: number
          valor_pago_centavos?: number
          valor_sinal_centavos?: number
          valor_total_centavos?: number
        }
        Update: {
          anfitriao_id?: string | null
          ativo?: boolean
          boas_vindas?: string | null
          capa_url?: string | null
          codigo_url?: string
          convite_audio_obrigado_url?: string | null
          convite_banner_topo_url?: string | null
          convite_endereco?: string | null
          convite_exibir_presentes?: boolean
          convite_foto_url?: string | null
          convite_horario_inicio?: string | null
          convite_horario_texto?: string | null
          convite_ideias_presentes?: string[]
          convite_musica_url?: string | null
          convite_nome_local?: string | null
          convite_tamanho_calcado?: string | null
          convite_tamanho_roupa?: string | null
          convite_texto_chamada?: string | null
          convite_texto_prazo_rsvp?: string | null
          convite_titulo_tamanhos?: string | null
          convite_whatsapp_contato?: string | null
          cor_primaria?: string
          cor_secundaria?: string
          created_at?: string
          creditos_b2b_consumidos?: number
          data_evento?: string | null
          desconto_centavos?: number
          expira_em?: string | null
          galeria_publica?: boolean
          id?: string
          idade_aniversariante?: string | null
          inclui_convite?: boolean
          inclui_galeria?: boolean
          inclui_telao?: boolean
          is_demo?: boolean
          limite_molduras?: number
          metodo_pagamento?: Database["public"]["Enums"]["festa_metodo_pagamento_enum"]
          moderacao_previa?: boolean
          nome_aniversariante?: string | null
          observacoes_internas?: string | null
          pacote?: Database["public"]["Enums"]["festa_pacote_tipo_enum"] | null
          parceiro_id?: string | null
          permite_envio_midias?: boolean
          permite_video?: boolean
          pix_copia_cola?: string | null
          pix_txid?: string | null
          qr_code_pdf_url?: string | null
          slug?: string
          status_pedido?: Database["public"]["Enums"]["festa_status_pedido_enum"]
          subtitulo?: string | null
          tema_id?: string | null
          tempo_slideshow_segundos?: number
          titulo?: string
          token_gestao?: string
          updated_at?: string
          valor_extras_centavos?: number
          valor_pacote_centavos?: number
          valor_pago_centavos?: number
          valor_sinal_centavos?: number
          valor_total_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "festa_eventos_anfitriao_id_fkey"
            columns: ["anfitriao_id"]
            isOneToOne: false
            referencedRelation: "festa_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festa_eventos_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "festa_parceiros_b2b"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festa_eventos_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "festa_temas_catalogo"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_parceiros_b2b: {
        Row: {
          ativo: boolean
          cor_marca: string | null
          created_at: string
          documento: string | null
          email: string | null
          id: string
          logo_url: string | null
          nome_empresa: string
          plano_b2b_id: string | null
          saldo_creditos: number
          status_assinatura: Database["public"]["Enums"]["festa_status_assinatura_b2b_enum"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cor_marca?: string | null
          created_at?: string
          documento?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nome_empresa: string
          plano_b2b_id?: string | null
          saldo_creditos?: number
          status_assinatura?: Database["public"]["Enums"]["festa_status_assinatura_b2b_enum"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cor_marca?: string | null
          created_at?: string
          documento?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nome_empresa?: string
          plano_b2b_id?: string | null
          saldo_creditos?: number
          status_assinatura?: Database["public"]["Enums"]["festa_status_assinatura_b2b_enum"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "festa_parceiros_b2b_plano_b2b_id_fkey"
            columns: ["plano_b2b_id"]
            isOneToOne: false
            referencedRelation: "festa_catalogo_planos_b2b"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_recuperacoes_senha: {
        Row: {
          codigo: string
          created_at: string
          expira_em: string
          id: string
          usado: boolean
          usuario_id: string
        }
        Insert: {
          codigo: string
          created_at?: string
          expira_em: string
          id?: string
          usado?: boolean
          usuario_id: string
        }
        Update: {
          codigo?: string
          created_at?: string
          expira_em?: string
          id?: string
          usado?: boolean
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "festa_recuperacoes_senha_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "festa_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_temas_catalogo: {
        Row: {
          ativo: boolean
          categoria: Database["public"]["Enums"]["festa_categoria_tema_enum"]
          cor_primaria_padrao: string
          cor_secundaria_padrao: string
          created_at: string
          id: string
          moldura_preview_url: string | null
          nome: string
          ordem: number
          parceiro_proprietario_id: string | null
          publico: boolean
          slug: string
          thumb_url: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: Database["public"]["Enums"]["festa_categoria_tema_enum"]
          cor_primaria_padrao?: string
          cor_secundaria_padrao?: string
          created_at?: string
          id?: string
          moldura_preview_url?: string | null
          nome: string
          ordem?: number
          parceiro_proprietario_id?: string | null
          publico?: boolean
          slug: string
          thumb_url?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: Database["public"]["Enums"]["festa_categoria_tema_enum"]
          cor_primaria_padrao?: string
          cor_secundaria_padrao?: string
          created_at?: string
          id?: string
          moldura_preview_url?: string | null
          nome?: string
          ordem?: number
          parceiro_proprietario_id?: string | null
          publico?: boolean
          slug?: string
          thumb_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "festa_temas_catalogo_parceiro_proprietario_id_fkey"
            columns: ["parceiro_proprietario_id"]
            isOneToOne: false
            referencedRelation: "festa_parceiros_b2b"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_transacoes_creditos_b2b: {
        Row: {
          created_at: string
          evento_id: string | null
          id: string
          observacao: string | null
          parceiro_id: string
          quantidade: number
          tipo: Database["public"]["Enums"]["festa_tipo_transacao_credito_enum"]
        }
        Insert: {
          created_at?: string
          evento_id?: string | null
          id?: string
          observacao?: string | null
          parceiro_id: string
          quantidade: number
          tipo: Database["public"]["Enums"]["festa_tipo_transacao_credito_enum"]
        }
        Update: {
          created_at?: string
          evento_id?: string | null
          id?: string
          observacao?: string | null
          parceiro_id?: string
          quantidade?: number
          tipo?: Database["public"]["Enums"]["festa_tipo_transacao_credito_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "festa_transacoes_creditos_b2b_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "festa_eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festa_transacoes_creditos_b2b_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "festa_parceiros_b2b"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_usuarios: {
        Row: {
          ativo: boolean
          auth_user_id: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          parceiro_id: string | null
          telefone: string | null
          tipo_perfil: Database["public"]["Enums"]["festa_tipo_perfil_enum"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          auth_user_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          parceiro_id?: string | null
          telefone?: string | null
          tipo_perfil?: Database["public"]["Enums"]["festa_tipo_perfil_enum"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          auth_user_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          parceiro_id?: string | null
          telefone?: string | null
          tipo_perfil?: Database["public"]["Enums"]["festa_tipo_perfil_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "festa_usuarios_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "festa_parceiros_b2b"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      festa_ajustar_curtidas_midia: {
        Args: { p_midia_id: string; p_variacao: number }
        Returns: {
          autor: string | null
          created_at: string
          curtidas: number
          duracao_segundos: number | null
          evento_id: string
          fixada_demo: boolean
          id: string
          moldura_id: string | null
          path: string
          sessao_id: string | null
          status_moderacao: Database["public"]["Enums"]["festa_status_moderacao_enum"]
          tamanho_bytes: number | null
          thumb_path: string | null
          tipo_midia: Database["public"]["Enums"]["festa_tipo_midia_enum"]
        }
        SetofOptions: {
          from: "*"
          to: "festa_evento_midias"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      festa_categoria_tema_enum:
        | "INFANTIL"
        | "QUINZE_ANOS"
        | "CASAMENTO"
        | "ADULTO"
        | "CORPORATIVO"
      festa_codigo_modulo_enum: "GALERIA" | "CONVITE"
      festa_efeito_extra_enum:
        | "MOLDURA_ADICIONAL"
        | "DIAS_GALERIA_ADICIONAIS"
        | "LIBERAR_VIDEO"
        | "LIBERAR_TELAO"
        | "ENTREGAVEL_MANUAL"
      festa_metodo_pagamento_enum:
        | "PIX_MANUAL"
        | "CARTAO_LINK"
        | "CORTESIA"
        | "CREDITO_B2B"
      festa_pacote_tipo_enum: "BASICO" | "COMPLETO"
      festa_status_assinatura_b2b_enum:
        | "TRIAL"
        | "ATIVA"
        | "INADIMPLENTE"
        | "CANCELADA"
      festa_status_moderacao_enum: "APROVADA" | "PENDENTE" | "OCULTA"
      festa_status_pedido_enum:
        | "AGUARDANDO_SINAL"
        | "SINAL_PAGO"
        | "AGUARDANDO_BRIEFING"
        | "EM_MONTAGEM"
        | "ENTREGUE"
        | "PAGO_COMPLETO"
        | "CANCELADO"
      festa_tipo_midia_enum: "FOTO" | "VIDEO"
      festa_tipo_perfil_enum:
        | "ADMIN"
        | "ANFITRIAO"
        | "PARCEIRO_ADMIN"
        | "PARCEIRO_OPERADOR"
      festa_tipo_transacao_credito_enum:
        | "RECARGA_PLANO"
        | "COMPRA_AVULSA"
        | "CONSUMO_EVENTO"
        | "ESTORNO"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      festa_categoria_tema_enum: [
        "INFANTIL",
        "QUINZE_ANOS",
        "CASAMENTO",
        "ADULTO",
        "CORPORATIVO",
      ],
      festa_codigo_modulo_enum: ["GALERIA", "CONVITE"],
      festa_efeito_extra_enum: [
        "MOLDURA_ADICIONAL",
        "DIAS_GALERIA_ADICIONAIS",
        "LIBERAR_VIDEO",
        "LIBERAR_TELAO",
        "ENTREGAVEL_MANUAL",
      ],
      festa_metodo_pagamento_enum: [
        "PIX_MANUAL",
        "CARTAO_LINK",
        "CORTESIA",
        "CREDITO_B2B",
      ],
      festa_pacote_tipo_enum: ["BASICO", "COMPLETO"],
      festa_status_assinatura_b2b_enum: [
        "TRIAL",
        "ATIVA",
        "INADIMPLENTE",
        "CANCELADA",
      ],
      festa_status_moderacao_enum: ["APROVADA", "PENDENTE", "OCULTA"],
      festa_status_pedido_enum: [
        "AGUARDANDO_SINAL",
        "SINAL_PAGO",
        "AGUARDANDO_BRIEFING",
        "EM_MONTAGEM",
        "ENTREGUE",
        "PAGO_COMPLETO",
        "CANCELADO",
      ],
      festa_tipo_midia_enum: ["FOTO", "VIDEO"],
      festa_tipo_perfil_enum: [
        "ADMIN",
        "ANFITRIAO",
        "PARCEIRO_ADMIN",
        "PARCEIRO_OPERADOR",
      ],
      festa_tipo_transacao_credito_enum: [
        "RECARGA_PLANO",
        "COMPRA_AVULSA",
        "CONSUMO_EVENTO",
        "ESTORNO",
      ],
    },
  },
} as const
