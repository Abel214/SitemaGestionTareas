# Generated by Django 5.0.6 on 2025-07-13 21:14

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tareas', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Archivo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='archivos/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Asignatura',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('descripcion', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Ciclo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('is_activo', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Paralelo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=50)),
                ('asignatura', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='paralelos', to='tareas.asignatura')),
                ('docente', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='paralelos_docente', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='GrupoTrabajo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('max_estudiantes', models.PositiveIntegerField()),
                ('estudiantes', models.ManyToManyField(related_name='grupos_trabajo', to=settings.AUTH_USER_MODEL)),
                ('paralelo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='grupos_trabajo', to='tareas.paralelo')),
            ],
        ),
        migrations.CreateModel(
            name='PeriodoCiclo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('periodo_inicio', models.DateField()),
                ('periodo_fin', models.DateField()),
                ('ciclo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='periodos', to='tareas.ciclo')),
            ],
        ),
        migrations.AddField(
            model_name='asignatura',
            name='periodo',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='asignaturas', to='tareas.periodociclo'),
        ),
        migrations.CreateModel(
            name='Reporte',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateField(auto_now_add=True)),
                ('asignatura', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reportes', to='tareas.asignatura')),
                ('ciclo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reportes', to='tareas.ciclo')),
                ('responsable', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reportes', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Tarea',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=200)),
                ('descripcion', models.TextField(blank=True)),
                ('fecha_limite', models.DateField()),
                ('tipo', models.CharField(choices=[('TPE', 'Aprendizaje práctico experimental'), ('ACD', 'Aprendizaje en contacto con el docente'), ('AA', 'Aprendizaje autónomo')], max_length=3)),
                ('adjuntos', models.ManyToManyField(blank=True, related_name='tareas', to='tareas.archivo')),
                ('estudiantes_asignados', models.ManyToManyField(blank=True, related_name='tareas_asignadas', to=settings.AUTH_USER_MODEL)),
                ('grupos_asignados', models.ManyToManyField(blank=True, related_name='tareas', to='tareas.grupotrabajo')),
            ],
        ),
        migrations.CreateModel(
            name='Entrega',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_calificada', models.BooleanField(default=False)),
                ('calificacion', models.FloatField(blank=True, null=True)),
                ('retroalimentacion', models.TextField(blank=True)),
                ('adjuntos', models.ManyToManyField(blank=True, related_name='entregas', to='tareas.archivo')),
                ('retroalimentacion_adjuntos', models.ManyToManyField(blank=True, related_name='entregas_retro', to='tareas.archivo')),
                ('tarea', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='entrega', to='tareas.tarea')),
            ],
        ),
        migrations.CreateModel(
            name='UsuarioParalelo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateField(auto_now_add=True)),
                ('paralelo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inscripciones', to='tareas.paralelo')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inscripciones', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='paralelo',
            name='estudiantes',
            field=models.ManyToManyField(related_name='paralelos_estudiante', through='tareas.UsuarioParalelo', to=settings.AUTH_USER_MODEL),
        ),
    ]
