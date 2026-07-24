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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accesos: {
        Row: {
          autorizado_por: string | null
          condominio_id: string
          created_at: string
          dias_semana: number[]
          es_permanente: boolean
          fecha_entrada: string | null
          fecha_salida: string | null
          hora_fin: string | null
          hora_inicio: string | null
          id: string
          metodo: string | null
          minutos_max_estadia: number | null
          qr_code: string | null
          tipo: string | null
          unidad_id: string | null
          usos_actuales: number
          usos_maximos: number
          visitante_nombre: string
        }
        Insert: {
          autorizado_por?: string | null
          condominio_id: string
          created_at?: string
          dias_semana?: number[]
          es_permanente?: boolean
          fecha_entrada?: string | null
          fecha_salida?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          metodo?: string | null
          minutos_max_estadia?: number | null
          qr_code?: string | null
          tipo?: string | null
          unidad_id?: string | null
          usos_actuales?: number
          usos_maximos?: number
          visitante_nombre: string
        }
        Update: {
          autorizado_por?: string | null
          condominio_id?: string
          created_at?: string
          dias_semana?: number[]
          es_permanente?: boolean
          fecha_entrada?: string | null
          fecha_salida?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          metodo?: string | null
          minutos_max_estadia?: number | null
          qr_code?: string | null
          tipo?: string | null
          unidad_id?: string | null
          usos_actuales?: number
          usos_maximos?: number
          visitante_nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "accesos_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accesos_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      actividades_crm: {
        Row: {
          agente_id: string | null
          created_at: string
          descripcion: string | null
          fecha_actividad: string
          id: string
          prospecto_id: string
          proximo_paso: string | null
          resultado: string | null
          tipo: string
          unidad_id: string | null
        }
        Insert: {
          agente_id?: string | null
          created_at?: string
          descripcion?: string | null
          fecha_actividad?: string
          id?: string
          prospecto_id: string
          proximo_paso?: string | null
          resultado?: string | null
          tipo: string
          unidad_id?: string | null
        }
        Update: {
          agente_id?: string | null
          created_at?: string
          descripcion?: string | null
          fecha_actividad?: string
          id?: string
          prospecto_id?: string
          proximo_paso?: string | null
          resultado?: string | null
          tipo?: string
          unidad_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actividades_crm_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_crm_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      areas_comunes: {
        Row: {
          activa: boolean
          capacidad: number | null
          condominio_id: string
          costo_por_hora_extra: number
          costo_por_persona_extra: number
          created_at: string
          horario_fin: string | null
          horario_inicio: string | null
          horas_incluidas: number | null
          icono: string | null
          id: string
          nombre: string
          permite_exceso: boolean
        }
        Insert: {
          activa?: boolean
          capacidad?: number | null
          condominio_id: string
          costo_por_hora_extra?: number
          costo_por_persona_extra?: number
          created_at?: string
          horario_fin?: string | null
          horario_inicio?: string | null
          horas_incluidas?: number | null
          icono?: string | null
          id?: string
          nombre: string
          permite_exceso?: boolean
        }
        Update: {
          activa?: boolean
          capacidad?: number | null
          condominio_id?: string
          costo_por_hora_extra?: number
          costo_por_persona_extra?: number
          created_at?: string
          horario_fin?: string | null
          horario_inicio?: string | null
          horas_incluidas?: number | null
          icono?: string | null
          id?: string
          nombre?: string
          permite_exceso?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "areas_comunes_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      cobros: {
        Row: {
          concepto: string
          condominio_id: string
          creado_por: string | null
          created_at: string
          estado: Database["public"]["Enums"]["estado_cobro"]
          fecha_pago: string | null
          fecha_vencimiento: string
          id: string
          metodo_pago: string | null
          monto: number
          mora_aplicada: number
          notas: string | null
          periodo: string | null
          recibo_numero: string | null
          residente_id: string | null
          unidad_id: string | null
        }
        Insert: {
          concepto: string
          condominio_id: string
          creado_por?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_cobro"]
          fecha_pago?: string | null
          fecha_vencimiento: string
          id?: string
          metodo_pago?: string | null
          monto: number
          mora_aplicada?: number
          notas?: string | null
          periodo?: string | null
          recibo_numero?: string | null
          residente_id?: string | null
          unidad_id?: string | null
        }
        Update: {
          concepto?: string
          condominio_id?: string
          creado_por?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_cobro"]
          fecha_pago?: string | null
          fecha_vencimiento?: string
          id?: string
          metodo_pago?: string | null
          monto?: number
          mora_aplicada?: number
          notas?: string | null
          periodo?: string | null
          recibo_numero?: string | null
          residente_id?: string | null
          unidad_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cobros_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobros_residente_id_fkey"
            columns: ["residente_id"]
            isOneToOne: false
            referencedRelation: "residentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobros_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicados: {
        Row: {
          canal: string | null
          condominio_id: string
          creado_por: string | null
          created_at: string
          cuerpo: string | null
          destinatarios: Json | null
          enviado_en: string | null
          id: string
          programado_para: string | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          canal?: string | null
          condominio_id: string
          creado_por?: string | null
          created_at?: string
          cuerpo?: string | null
          destinatarios?: Json | null
          enviado_en?: string | null
          id?: string
          programado_para?: string | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          canal?: string | null
          condominio_id?: string
          creado_por?: string | null
          created_at?: string
          cuerpo?: string | null
          destinatarios?: Json | null
          enviado_en?: string | null
          id?: string
          programado_para?: string | null
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunicados_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      condominio_members: {
        Row: {
          condominio_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          condominio_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          condominio_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "condominio_members_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      condominios: {
        Row: {
          activo: boolean
          admin_id: string | null
          auto_aplicar_mora: boolean
          auto_generar_cobros: boolean
          ciudad: string | null
          concepto_mensual: string
          created_at: string
          cuota_base: number | null
          cuota_modo: string
          cuota_por_m2: number
          departamento: string | null
          dia_emision_cobros: number
          dias_gracia: number
          dias_plazo_pago: number
          direccion: string | null
          id: string
          latitud: number | null
          logo_url: string | null
          longitud: number | null
          maps_url: string | null
          moneda: string
          nombre: string
          pais: string
          recargo_mora_pct: number
          tipo: string
          total_unidades: number | null
        }
        Insert: {
          activo?: boolean
          admin_id?: string | null
          auto_aplicar_mora?: boolean
          auto_generar_cobros?: boolean
          ciudad?: string | null
          concepto_mensual?: string
          created_at?: string
          cuota_base?: number | null
          cuota_modo?: string
          cuota_por_m2?: number
          departamento?: string | null
          dia_emision_cobros?: number
          dias_gracia?: number
          dias_plazo_pago?: number
          direccion?: string | null
          id?: string
          latitud?: number | null
          logo_url?: string | null
          longitud?: number | null
          maps_url?: string | null
          moneda?: string
          nombre: string
          pais?: string
          recargo_mora_pct?: number
          tipo?: string
          total_unidades?: number | null
        }
        Update: {
          activo?: boolean
          admin_id?: string | null
          auto_aplicar_mora?: boolean
          auto_generar_cobros?: boolean
          ciudad?: string | null
          concepto_mensual?: string
          created_at?: string
          cuota_base?: number | null
          cuota_modo?: string
          cuota_por_m2?: number
          departamento?: string | null
          dia_emision_cobros?: number
          dias_gracia?: number
          dias_plazo_pago?: number
          direccion?: string | null
          id?: string
          latitud?: number | null
          logo_url?: string | null
          longitud?: number | null
          maps_url?: string | null
          moneda?: string
          nombre?: string
          pais?: string
          recargo_mora_pct?: number
          tipo?: string
          total_unidades?: number | null
        }
        Relationships: []
      }
      egresos: {
        Row: {
          aprobado_por: string | null
          categoria: string
          comprobante_url: string | null
          condominio_id: string
          created_at: string
          descripcion: string | null
          fecha: string
          id: string
          monto: number
          proveedor: string | null
        }
        Insert: {
          aprobado_por?: string | null
          categoria: string
          comprobante_url?: string | null
          condominio_id: string
          created_at?: string
          descripcion?: string | null
          fecha?: string
          id?: string
          monto: number
          proveedor?: string | null
        }
        Update: {
          aprobado_por?: string | null
          categoria?: string
          comprobante_url?: string | null
          condominio_id?: string
          created_at?: string
          descripcion?: string | null
          fecha?: string
          id?: string
          monto?: number
          proveedor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "egresos_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_agenda: {
        Row: {
          agente_id: string | null
          created_at: string
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          notas: string | null
          prospecto_id: string | null
          recordatorio_min: number | null
          tipo: string
          titulo: string
          unidad_id: string | null
        }
        Insert: {
          agente_id?: string | null
          created_at?: string
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          notas?: string | null
          prospecto_id?: string | null
          recordatorio_min?: number | null
          tipo: string
          titulo: string
          unidad_id?: string | null
        }
        Update: {
          agente_id?: string | null
          created_at?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          notas?: string | null
          prospecto_id?: string | null
          recordatorio_min?: number | null
          tipo?: string
          titulo?: string
          unidad_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_agenda_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_agenda_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      guardia_turnos: {
        Row: {
          condominio_id: string
          created_at: string
          created_by: string | null
          estado: string
          fecha: string
          fin_real: string | null
          guardia_id: string
          hora_fin: string
          hora_inicio: string
          id: string
          inicio_real: string | null
          notas: string | null
          updated_at: string
        }
        Insert: {
          condominio_id: string
          created_at?: string
          created_by?: string | null
          estado?: string
          fecha: string
          fin_real?: string | null
          guardia_id: string
          hora_fin: string
          hora_inicio: string
          id?: string
          inicio_real?: string | null
          notas?: string | null
          updated_at?: string
        }
        Update: {
          condominio_id?: string
          created_at?: string
          created_by?: string | null
          estado?: string
          fecha?: string
          fin_real?: string | null
          guardia_id?: string
          hora_fin?: string
          hora_inicio?: string
          id?: string
          inicio_real?: string | null
          notas?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardia_turnos_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      incidencias: {
        Row: {
          asignado_a: string | null
          condominio_id: string
          created_at: string
          descripcion: string
          estado: Database["public"]["Enums"]["estado_incidencia"]
          fotos_urls: Json | null
          id: string
          prioridad: Database["public"]["Enums"]["prioridad_incidencia"]
          reportado_por: string | null
          resuelto_en: string | null
          tipo: string | null
          unidad_id: string | null
        }
        Insert: {
          asignado_a?: string | null
          condominio_id: string
          created_at?: string
          descripcion: string
          estado?: Database["public"]["Enums"]["estado_incidencia"]
          fotos_urls?: Json | null
          id?: string
          prioridad?: Database["public"]["Enums"]["prioridad_incidencia"]
          reportado_por?: string | null
          resuelto_en?: string | null
          tipo?: string | null
          unidad_id?: string | null
        }
        Update: {
          asignado_a?: string | null
          condominio_id?: string
          created_at?: string
          descripcion?: string
          estado?: Database["public"]["Enums"]["estado_incidencia"]
          fotos_urls?: Json | null
          id?: string
          prioridad?: Database["public"]["Enums"]["prioridad_incidencia"]
          reportado_por?: string | null
          resuelto_en?: string | null
          tipo?: string | null
          unidad_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidencias_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidencias_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      invitaciones_residente: {
        Row: {
          codigo: string
          condominio_id: string
          created_at: string
          email: string
          estado: string
          expira_en: string
          generado_por: string | null
          id: string
          residente_id: string | null
          unidad_id: string | null
          usada_en: string | null
          usada_por: string | null
        }
        Insert: {
          codigo: string
          condominio_id: string
          created_at?: string
          email: string
          estado?: string
          expira_en?: string
          generado_por?: string | null
          id?: string
          residente_id?: string | null
          unidad_id?: string | null
          usada_en?: string | null
          usada_por?: string | null
        }
        Update: {
          codigo?: string
          condominio_id?: string
          created_at?: string
          email?: string
          estado?: string
          expira_en?: string
          generado_por?: string | null
          id?: string
          residente_id?: string | null
          unidad_id?: string | null
          usada_en?: string | null
          usada_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitaciones_residente_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitaciones_residente_residente_id_fkey"
            columns: ["residente_id"]
            isOneToOne: false
            referencedRelation: "residentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitaciones_residente_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      ordenes_mantenimiento: {
        Row: {
          area: string | null
          condominio_id: string
          costo_estimado: number | null
          costo_real: number | null
          created_at: string
          descripcion: string | null
          estado: Database["public"]["Enums"]["estado_orden"]
          fecha_limite: string | null
          id: string
          prioridad: Database["public"]["Enums"]["prioridad_incidencia"] | null
          proveedor_id: string | null
          titulo: string
        }
        Insert: {
          area?: string | null
          condominio_id: string
          costo_estimado?: number | null
          costo_real?: number | null
          created_at?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_orden"]
          fecha_limite?: string | null
          id?: string
          prioridad?: Database["public"]["Enums"]["prioridad_incidencia"] | null
          proveedor_id?: string | null
          titulo: string
        }
        Update: {
          area?: string | null
          condominio_id?: string
          costo_estimado?: number | null
          costo_real?: number | null
          created_at?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_orden"]
          fecha_limite?: string | null
          id?: string
          prioridad?: Database["public"]["Enums"]["prioridad_incidencia"] | null
          proveedor_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_mantenimiento_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_mantenimiento_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          cobro_id: string
          comprobante_url: string | null
          created_at: string
          fecha: string
          id: string
          metodo: string
          monto: number
          notas: string | null
          referencia: string | null
          registrado_por: string | null
        }
        Insert: {
          cobro_id: string
          comprobante_url?: string | null
          created_at?: string
          fecha?: string
          id?: string
          metodo?: string
          monto: number
          notas?: string | null
          referencia?: string | null
          registrado_por?: string | null
        }
        Update: {
          cobro_id?: string
          comprobante_url?: string | null
          created_at?: string
          fecha?: string
          id?: string
          metodo?: string
          monto?: number
          notas?: string | null
          referencia?: string | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_cobro_id_fkey"
            columns: ["cobro_id"]
            isOneToOne: false
            referencedRelation: "cobros"
            referencedColumns: ["id"]
          },
        ]
      }
      personas_autorizadas: {
        Row: {
          created_at: string
          id: string
          nombre: string
          relacion: string | null
          residente_id: string
          tipo_acceso: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          relacion?: string | null
          residente_id: string
          tipo_acceso?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          relacion?: string | null
          residente_id?: string
          tipo_acceso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personas_autorizadas_residente_id_fkey"
            columns: ["residente_id"]
            isOneToOne: false
            referencedRelation: "residentes"
            referencedColumns: ["id"]
          },
        ]
      }
      planes: {
        Row: {
          activo: boolean
          created_at: string
          features: Json
          id: string
          max_admins: number | null
          max_edificios: number | null
          max_unidades: number | null
          nombre: string
          orden: number
          precio_mensual: number
        }
        Insert: {
          activo?: boolean
          created_at?: string
          features?: Json
          id?: string
          max_admins?: number | null
          max_edificios?: number | null
          max_unidades?: number | null
          nombre: string
          orden?: number
          precio_mensual?: number
        }
        Update: {
          activo?: boolean
          created_at?: string
          features?: Json
          id?: string
          max_admins?: number | null
          max_edificios?: number | null
          max_unidades?: number | null
          nombre?: string
          orden?: number
          precio_mensual?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          plan_seleccionado: string | null
          updated_at: string
          usd_rate: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          plan_seleccionado?: string | null
          updated_at?: string
          usd_rate?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          plan_seleccionado?: string | null
          updated_at?: string
          usd_rate?: number
        }
        Relationships: []
      }
      propiedades_interes: {
        Row: {
          created_at: string
          estado: string | null
          id: string
          prospecto_id: string
          unidad_id: string
        }
        Insert: {
          created_at?: string
          estado?: string | null
          id?: string
          prospecto_id: string
          unidad_id: string
        }
        Update: {
          created_at?: string
          estado?: string | null
          id?: string
          prospecto_id?: string
          unidad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "propiedades_interes_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propiedades_interes_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      prospectos: {
        Row: {
          agente_id: string | null
          apellido: string | null
          caracteristicas_deseadas: string | null
          condominio_id: string | null
          created_at: string
          dni: string | null
          email: string | null
          etapa_pipeline: Database["public"]["Enums"]["etapa_pipeline"]
          id: string
          nombre: string
          notas: string | null
          origen: string | null
          presupuesto_max: number | null
          presupuesto_min: number | null
          telefono: string | null
          temperatura: Database["public"]["Enums"]["temperatura_prospecto"]
          tipo: Database["public"]["Enums"]["tipo_prospecto"]
          ultimo_contacto: string | null
          unidad_id: string | null
          whatsapp: string | null
          zonas_interes: Json | null
        }
        Insert: {
          agente_id?: string | null
          apellido?: string | null
          caracteristicas_deseadas?: string | null
          condominio_id?: string | null
          created_at?: string
          dni?: string | null
          email?: string | null
          etapa_pipeline?: Database["public"]["Enums"]["etapa_pipeline"]
          id?: string
          nombre: string
          notas?: string | null
          origen?: string | null
          presupuesto_max?: number | null
          presupuesto_min?: number | null
          telefono?: string | null
          temperatura?: Database["public"]["Enums"]["temperatura_prospecto"]
          tipo?: Database["public"]["Enums"]["tipo_prospecto"]
          ultimo_contacto?: string | null
          unidad_id?: string | null
          whatsapp?: string | null
          zonas_interes?: Json | null
        }
        Update: {
          agente_id?: string | null
          apellido?: string | null
          caracteristicas_deseadas?: string | null
          condominio_id?: string | null
          created_at?: string
          dni?: string | null
          email?: string | null
          etapa_pipeline?: Database["public"]["Enums"]["etapa_pipeline"]
          id?: string
          nombre?: string
          notas?: string | null
          origen?: string | null
          presupuesto_max?: number | null
          presupuesto_min?: number | null
          telefono?: string | null
          temperatura?: Database["public"]["Enums"]["temperatura_prospecto"]
          tipo?: Database["public"]["Enums"]["tipo_prospecto"]
          ultimo_contacto?: string | null
          unidad_id?: string | null
          whatsapp?: string | null
          zonas_interes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "prospectos_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospectos_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedores: {
        Row: {
          calificacion: number | null
          condominio_id: string | null
          created_at: string
          email: string | null
          id: string
          nombre: string
          servicio: string | null
          telefono: string | null
        }
        Insert: {
          calificacion?: number | null
          condominio_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nombre: string
          servicio?: string | null
          telefono?: string | null
        }
        Update: {
          calificacion?: number | null
          condominio_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nombre?: string
          servicio?: string | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proveedores_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      puntos_rondin: {
        Row: {
          activo: boolean
          condominio_id: string
          created_at: string
          id: string
          nombre: string
          orden: number
          qr_code: string
          ubicacion: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          condominio_id: string
          created_at?: string
          id?: string
          nombre: string
          orden?: number
          qr_code: string
          ubicacion?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          condominio_id?: string
          created_at?: string
          id?: string
          nombre?: string
          orden?: number
          qr_code?: string
          ubicacion?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "puntos_rondin_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas: {
        Row: {
          aprobada_en: string | null
          aprobada_por: string | null
          area_id: string
          condominio_id: string
          created_at: string
          descripcion: string | null
          estado: string
          excede_capacidad: boolean
          fecha_fin: string
          fecha_inicio: string
          horas_extra: number
          id: string
          monto_extra: number
          num_personas: number | null
          pagado_extra: boolean
          personas_extra: number
          residente_id: string | null
          solicitud_nota: string | null
          unidad_id: string | null
        }
        Insert: {
          aprobada_en?: string | null
          aprobada_por?: string | null
          area_id: string
          condominio_id: string
          created_at?: string
          descripcion?: string | null
          estado?: string
          excede_capacidad?: boolean
          fecha_fin: string
          fecha_inicio: string
          horas_extra?: number
          id?: string
          monto_extra?: number
          num_personas?: number | null
          pagado_extra?: boolean
          personas_extra?: number
          residente_id?: string | null
          solicitud_nota?: string | null
          unidad_id?: string | null
        }
        Update: {
          aprobada_en?: string | null
          aprobada_por?: string | null
          area_id?: string
          condominio_id?: string
          created_at?: string
          descripcion?: string | null
          estado?: string
          excede_capacidad?: boolean
          fecha_fin?: string
          fecha_inicio?: string
          horas_extra?: number
          id?: string
          monto_extra?: number
          num_personas?: number | null
          pagado_extra?: boolean
          personas_extra?: number
          residente_id?: string | null
          solicitud_nota?: string | null
          unidad_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservas_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas_comunes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_residente_id_fkey"
            columns: ["residente_id"]
            isOneToOne: false
            referencedRelation: "residentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      residentes: {
        Row: {
          activo: boolean
          apellido: string
          condominio_id: string
          created_at: string
          dni: string | null
          email: string | null
          fecha_ingreso: string
          foto_url: string | null
          id: string
          nombre: string
          recargo_mora_pct: number
          relacionado_id: string | null
          telefono: string | null
          telefono_alt: string | null
          tipo: Database["public"]["Enums"]["tipo_residente"]
          unidad_id: string | null
          user_id: string | null
        }
        Insert: {
          activo?: boolean
          apellido: string
          condominio_id: string
          created_at?: string
          dni?: string | null
          email?: string | null
          fecha_ingreso?: string
          foto_url?: string | null
          id?: string
          nombre: string
          recargo_mora_pct?: number
          relacionado_id?: string | null
          telefono?: string | null
          telefono_alt?: string | null
          tipo?: Database["public"]["Enums"]["tipo_residente"]
          unidad_id?: string | null
          user_id?: string | null
        }
        Update: {
          activo?: boolean
          apellido?: string
          condominio_id?: string
          created_at?: string
          dni?: string | null
          email?: string | null
          fecha_ingreso?: string
          foto_url?: string | null
          id?: string
          nombre?: string
          recargo_mora_pct?: number
          relacionado_id?: string | null
          telefono?: string | null
          telefono_alt?: string | null
          tipo?: Database["public"]["Enums"]["tipo_residente"]
          unidad_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residentes_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residentes_relacionado_id_fkey"
            columns: ["relacionado_id"]
            isOneToOne: false
            referencedRelation: "residentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residentes_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      rondines_log: {
        Row: {
          condominio_id: string
          created_at: string
          foto_url: string | null
          guardia_id: string
          id: string
          notas: string | null
          punto_id: string
          scanned_at: string
          turno_id: string
        }
        Insert: {
          condominio_id: string
          created_at?: string
          foto_url?: string | null
          guardia_id: string
          id?: string
          notas?: string | null
          punto_id: string
          scanned_at?: string
          turno_id: string
        }
        Update: {
          condominio_id?: string
          created_at?: string
          foto_url?: string | null
          guardia_id?: string
          id?: string
          notas?: string | null
          punto_id?: string
          scanned_at?: string
          turno_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rondines_log_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rondines_log_punto_id_fkey"
            columns: ["punto_id"]
            isOneToOne: false
            referencedRelation: "puntos_rondin"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rondines_log_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: false
            referencedRelation: "guardia_turnos"
            referencedColumns: ["id"]
          },
        ]
      }
      suscripciones: {
        Row: {
          condominio_id: string
          created_at: string
          estado: string
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          plan_id: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          condominio_id: string
          created_at?: string
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          plan_id: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          condominio_id?: string
          created_at?: string
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          plan_id?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades: {
        Row: {
          agente_id: string | null
          amenidades: Json | null
          area_m2_construccion: number | null
          area_m2_terreno: number | null
          banos: number | null
          banos_visita: number | null
          condominio_id: string
          created_at: string
          deposito: number | null
          descripcion_comercial: string | null
          estado_administrativo: Database["public"]["Enums"]["estado_administrativo"]
          estado_comercial: Database["public"]["Enums"]["estado_comercial"]
          fecha_disponibilidad: string | null
          fecha_publicacion_comercial: string | null
          fotos_urls: Json | null
          habitaciones: number | null
          id: string
          inquilino_id: string | null
          mantenimiento_mensual: number | null
          moneda: string
          numero: string
          parqueos: number | null
          piso: number | null
          precio_negociable: boolean | null
          precio_renta: number | null
          precio_venta: number | null
          propietario_id: string | null
          referido_renta_agencia: string | null
          referido_renta_nombre: string | null
          referido_renta_url: string | null
          referido_venta_agencia: string | null
          referido_venta_nombre: string | null
          referido_venta_url: string | null
          tipo: string | null
        }
        Insert: {
          agente_id?: string | null
          amenidades?: Json | null
          area_m2_construccion?: number | null
          area_m2_terreno?: number | null
          banos?: number | null
          banos_visita?: number | null
          condominio_id: string
          created_at?: string
          deposito?: number | null
          descripcion_comercial?: string | null
          estado_administrativo?: Database["public"]["Enums"]["estado_administrativo"]
          estado_comercial?: Database["public"]["Enums"]["estado_comercial"]
          fecha_disponibilidad?: string | null
          fecha_publicacion_comercial?: string | null
          fotos_urls?: Json | null
          habitaciones?: number | null
          id?: string
          inquilino_id?: string | null
          mantenimiento_mensual?: number | null
          moneda?: string
          numero: string
          parqueos?: number | null
          piso?: number | null
          precio_negociable?: boolean | null
          precio_renta?: number | null
          precio_venta?: number | null
          propietario_id?: string | null
          referido_renta_agencia?: string | null
          referido_renta_nombre?: string | null
          referido_renta_url?: string | null
          referido_venta_agencia?: string | null
          referido_venta_nombre?: string | null
          referido_venta_url?: string | null
          tipo?: string | null
        }
        Update: {
          agente_id?: string | null
          amenidades?: Json | null
          area_m2_construccion?: number | null
          area_m2_terreno?: number | null
          banos?: number | null
          banos_visita?: number | null
          condominio_id?: string
          created_at?: string
          deposito?: number | null
          descripcion_comercial?: string | null
          estado_administrativo?: Database["public"]["Enums"]["estado_administrativo"]
          estado_comercial?: Database["public"]["Enums"]["estado_comercial"]
          fecha_disponibilidad?: string | null
          fecha_publicacion_comercial?: string | null
          fotos_urls?: Json | null
          habitaciones?: number | null
          id?: string
          inquilino_id?: string | null
          mantenimiento_mensual?: number | null
          moneda?: string
          numero?: string
          parqueos?: number | null
          piso?: number | null
          precio_negociable?: boolean | null
          precio_renta?: number | null
          precio_venta?: number | null
          propietario_id?: string | null
          referido_renta_agencia?: string | null
          referido_renta_nombre?: string | null
          referido_renta_url?: string | null
          referido_venta_agencia?: string | null
          referido_venta_nombre?: string | null
          referido_venta_url?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unidades_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehiculos: {
        Row: {
          ano: number | null
          color: string | null
          created_at: string
          id: string
          marca: string | null
          modelo: string | null
          placa: string
          residente_id: string
        }
        Insert: {
          ano?: number | null
          color?: string | null
          created_at?: string
          id?: string
          marca?: string | null
          modelo?: string | null
          placa: string
          residente_id: string
        }
        Update: {
          ano?: number | null
          color?: string | null
          created_at?: string
          id?: string
          marca?: string | null
          modelo?: string | null
          placa?: string
          residente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehiculos_residente_id_fkey"
            columns: ["residente_id"]
            isOneToOne: false
            referencedRelation: "residentes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aplicar_mora_automatica: { Args: never; Returns: number }
      aplicar_mora_masiva: {
        Args: { _condo_id: string; _pct: number; _solo_vacios?: boolean }
        Returns: number
      }
      assign_user_to_condominio: {
        Args: {
          _condo_id: string
          _email: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: string
      }
      can_access_condominio: { Args: { _condo_id: string }; Returns: boolean }
      can_manage_condominio: { Args: { _condo_id: string }; Returns: boolean }
      crear_condominio: {
        Args: {
          _ciudad?: string
          _cuota_base?: number
          _departamento?: string
          _dias_gracia?: number
          _direccion?: string
          _latitud?: number
          _logo_url?: string
          _longitud?: number
          _maps_url?: string
          _moneda?: string
          _nombre: string
          _pais?: string
          _recargo_mora_pct?: number
          _tipo?: string
          _total_unidades?: number
        }
        Returns: {
          activo: boolean
          admin_id: string | null
          auto_aplicar_mora: boolean
          auto_generar_cobros: boolean
          ciudad: string | null
          concepto_mensual: string
          created_at: string
          cuota_base: number | null
          cuota_modo: string
          cuota_por_m2: number
          departamento: string | null
          dia_emision_cobros: number
          dias_gracia: number
          dias_plazo_pago: number
          direccion: string | null
          id: string
          latitud: number | null
          logo_url: string | null
          longitud: number | null
          maps_url: string | null
          moneda: string
          nombre: string
          pais: string
          recargo_mora_pct: number
          tipo: string
          total_unidades: number | null
        }
        SetofOptions: {
          from: "*"
          to: "condominios"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generar_cobros_automaticos: { Args: never; Returns: number }
      generar_invitacion_residente: {
        Args: { _residente_id: string }
        Returns: {
          codigo: string
          expira_en: string
        }[]
      }
      get_admin_plan_limits: {
        Args: { _admin_id: string }
        Returns: {
          max_admins: number
          max_edificios: number
          max_unidades: number
        }[]
      }
      get_condominio_plan_limits: {
        Args: { _condo_id: string }
        Returns: {
          max_admins: number
          max_unidades: number
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_subscription_active: { Args: { _condo_id: string }; Returns: boolean }
      marcar_cobros_vencidos: { Args: { _condo_id?: string }; Returns: number }
      remove_user_from_condominio: {
        Args: { _condo_id: string; _user_id: string }
        Returns: undefined
      }
      shares_managed_condominio_with: {
        Args: { _target: string }
        Returns: boolean
      }
      validar_invitacion: {
        Args: { _codigo: string; _email: string }
        Returns: {
          condominio_id: string
          mensaje: string
          residente_id: string
          valida: boolean
        }[]
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin_condominio"
        | "junta_directiva"
        | "residente"
        | "agente_inmobiliario"
        | "gerente_crm"
        | "guardia"
      estado_administrativo: "ocupada" | "disponible" | "vacia"
      estado_cobro: "pendiente" | "pagado" | "parcial" | "vencido"
      estado_comercial:
        | "ocupada"
        | "disponible"
        | "en_venta"
        | "en_renta"
        | "en_venta_y_renta"
        | "reservada"
      estado_incidencia:
        | "nuevo"
        | "en_revision"
        | "en_proceso"
        | "resuelto"
        | "cerrado"
      estado_orden: "pendiente" | "en_proceso" | "completado" | "cancelado"
      etapa_pipeline:
        | "nuevo"
        | "contactado"
        | "interesado"
        | "visita_agendada"
        | "negociacion"
        | "cierre"
        | "ganado"
        | "perdido"
      prioridad_incidencia: "baja" | "media" | "alta" | "urgente"
      temperatura_prospecto: "frio" | "tibio" | "caliente"
      tipo_prospecto:
        | "comprador"
        | "arrendatario"
        | "vendedor"
        | "inversionista"
      tipo_residente: "propietario" | "inquilino"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: [
        "super_admin",
        "admin_condominio",
        "junta_directiva",
        "residente",
        "agente_inmobiliario",
        "gerente_crm",
        "guardia",
      ],
      estado_administrativo: ["ocupada", "disponible", "vacia"],
      estado_cobro: ["pendiente", "pagado", "parcial", "vencido"],
      estado_comercial: [
        "ocupada",
        "disponible",
        "en_venta",
        "en_renta",
        "en_venta_y_renta",
        "reservada",
      ],
      estado_incidencia: [
        "nuevo",
        "en_revision",
        "en_proceso",
        "resuelto",
        "cerrado",
      ],
      estado_orden: ["pendiente", "en_proceso", "completado", "cancelado"],
      etapa_pipeline: [
        "nuevo",
        "contactado",
        "interesado",
        "visita_agendada",
        "negociacion",
        "cierre",
        "ganado",
        "perdido",
      ],
      prioridad_incidencia: ["baja", "media", "alta", "urgente"],
      temperatura_prospecto: ["frio", "tibio", "caliente"],
      tipo_prospecto: [
        "comprador",
        "arrendatario",
        "vendedor",
        "inversionista",
      ],
      tipo_residente: ["propietario", "inquilino"],
    },
  },
} as const
