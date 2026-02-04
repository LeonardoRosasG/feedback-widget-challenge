using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.Domain.Entities;

namespace server.Infrastructure.Persistence.Configurations;

public class FeedbackConfiguration : IEntityTypeConfiguration<Feedback>
{
    public void Configure(EntityTypeBuilder<Feedback> builder)
    {
        builder.ToTable("Feedbacks");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.Id)
            .ValueGeneratedNever();

        builder.Property(f => f.ProjectId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(f => f.UserId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(f => f.Rating)
            .IsRequired();

        builder.Property(f => f.Comment)
            .HasMaxLength(1000);

        builder.Property(f => f.Timestamp)
            .IsRequired();

        builder.Property(f => f.CreatedAt)
            .IsRequired();

        builder.HasIndex(f => f.ProjectId)
            .HasDatabaseName("IX_Feedbacks_ProjectId");

        builder.HasIndex(f => f.UserId)
            .HasDatabaseName("IX_Feedbacks_UserId");

        builder.HasIndex(f => new { f.ProjectId, f.CreatedAt })
            .HasDatabaseName("IX_Feedbacks_ProjectId_CreatedAt");
    }
}
